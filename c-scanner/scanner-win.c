#include <stdio.h>
#include <stdlib.h>
#include <errno.h>
#include <string.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <process.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include "scanner.h"

uint8_t coms[NDEVS];

HANDLE com_mutex, req_mutex, start_mutex;

void create_threads(HANDLE *h_threads, tparams_t *tparams);
BOOL find_serial_port(int n_thread, HANDLE *h_comm);
BOOL open_serial_port(int n_thread, HANDLE *h_comm, DWORD *event_mask);
BOOL read_scanner(HANDLE h_comm, DWORD dw_event_mask, char *buf, size_t size);
SOCKET conn_to_server(const char *hostname, int port);
void send_timbra_req(void *thread_params);
DWORD __print_err(const char *msg, va_list argptr);

int main(int argc, char *argv[])
{
    puts("MAIN | Execution started.");

    memset(coms, 0, sizeof(coms));

    // guest token must be specified as cmd arg
    if (argc < 2)
        throw_err("main | invalid arguments: token is missing");

    // get cmd args
    const char *token = argv[1];

    const char *hostname = (argc >= 3 && strlen(argv[2]) > 0) ? argv[2] : DEFAULT_HOSTNAME;
    int port = (argc >= 6 && atoi(argv[5]) > 0) ? atoi(argv[6]) : DEFAULT_PORT;

    body_args_t ba = { NULL };
    ba.postazione = (argc >= 4 && strlen(argv[3]) > 0) ? argv[4] : DEFAULT_POST;
    ba.cliente = (argc >= 3 && strlen(argv[4]) > 0) ? argv[3] : DEFAULT_CLIENTE;
    ba.barcode = NULL;

    int body_len = strlen(BODY_FORMAT) +
                   strlen(ba.cliente) + strlen(ba.postazione) + SCAN_BUF_SIZE;
    int req_len =
        strlen(MSG_FORMAT) + body_len + strlen(hostname) + strlen(token);

    /*#################################################################################################################*/

    // init ssl lib
    SSL_library_init();

    SSL_CTX *ctx = init_CTX();
    // connect to server
    SOCKET sock = conn_to_server(hostname, port);
    // make ssl connection
    SSL *ssl = SSL_new(ctx);
    SSL_set_fd(ssl, sock);
    if (SSL_connect(ssl) == -1)
    {
        ERR_print_errors_fp(stderr);
        throw_err("main | SSL_connect");
    }

    show_certs(ssl);

    /*#################################################################################################################*/

    // init mutexes
    com_mutex = CreateMutexW(NULL, FALSE, NULL);
    req_mutex = CreateMutexW(NULL, FALSE, NULL);
    start_mutex = CreateMutexW(NULL, FALSE, NULL);

    // params for threads
    tparams_t tparams = { NULL };
    tparams.ba = &ba;
    tparams.body_len = body_len;
    tparams.hostname = hostname;
    tparams.req_len = req_len;
    tparams.ssl = ssl;
    tparams.token = token;
    tparams.n_thread = 0;

    // init serial coms array
    memset(coms, 0, sizeof(coms));

    /*#################################################################################################################*/

    HANDLE h_threads[NDEVS] = { NULL };

    // create threads
    create_threads(h_threads, &tparams);

    puts("MAIN | Waiting for children.");

    // waiting for threads
    WaitForMultipleObjects(NDEVS, h_threads, TRUE, INFINITE);

    /*#################################################################################################################*/

    SSL_free(ssl);
    closesocket(sock);
    SSL_CTX_free(ctx);

    // close mutexes
    if (com_mutex)
        CloseHandle(com_mutex);
    if (req_mutex)
        CloseHandle(req_mutex);
    if(start_mutex)
        CloseHandle(start_mutex);

    puts("MAIN | Execution terminated.");

    return EXIT_SUCCESS;
}

void create_threads(HANDLE *h_threads, tparams_t *tparams) {
    WaitForSingleObject(start_mutex, 0L);
    // create NDEVS threads
    for (int i = 0; i < NDEVS; i++)
    {
        tparams->n_thread = i;
        h_threads[i] = (HANDLE)_beginthread(send_timbra_req, 0, (void *)tparams);
        if (!h_threads[i] || h_threads[i] == INVALID_HANDLE_VALUE)
            throw_err("main | _beginthread");
        
        printf("MAIN | Created THREAD %d.\n", i);
        WaitForSingleObject(start_mutex, INFINITE);
    }
}

void send_timbra_req(void *thread_params)
{
    // gather thread params
    tparams_t *tparams = (tparams_t *)thread_params;

    int n_thread = tparams->n_thread;
    printf("THREAD %d | Execution started.\n", n_thread);

    ReleaseMutex(start_mutex);

    body_args_t *ba = tparams->ba;

    const char *token = tparams->token;
    const char *hostname = tparams->hostname;

    SSL *ssl = tparams->ssl;

    int body_len = tparams->body_len;
    int req_len = tparams->req_len;

    /*#################################################################################################################*/

    HANDLE h_comm = INVALID_HANDLE_VALUE;
    DWORD event_mask;

    int nbytes;
    char request[req_len], response[MSG_LEN], body_msg[body_len], scan_buf[SCAN_BUF_SIZE];

    while (TRUE)
    {
        if (h_comm == INVALID_HANDLE_VALUE)
        {
            WaitForSingleObject(com_mutex, INFINITE);

            // connect scanner
            if (!open_serial_port(n_thread, &h_comm, &event_mask))
            {
                print_err("send_timbra_req | open_serial_port");

                if (h_comm) CloseHandle(h_comm);
                coms[n_thread] = 0;

                ReleaseMutex(com_mutex);

                Sleep(5000);
                continue;
            }

            printf("THREAD %d | Waiting for input scanner.\n", n_thread);

            ReleaseMutex(com_mutex);
        }

        // get barcode
        if (!read_scanner(h_comm, event_mask, scan_buf, sizeof(scan_buf)))
        {
            print_err("send_timbra_req | read_scanner");
            if (h_comm) CloseHandle(h_comm);
            coms[n_thread] = 0;
            Sleep(5000);
            continue;
        }

        // create msg request
        _snprintf_s(body_msg, sizeof(body_msg), sizeof(body_msg), BODY_FORMAT, scan_buf, ba->cliente, ba->postazione /*,
                 ba->tipo*/);
        _snprintf_s(request, sizeof(request), sizeof(request), MSG_FORMAT, hostname, token,
                 strlen(body_msg), body_msg);

        WaitForSingleObject(req_mutex, INFINITE);

        puts("---------------------------------------------------------------------------------------------------");
        puts(request);
        puts("---------------------------------------------------------------------------------------------------");

        // send request
        if (SSL_write(ssl, request, strlen(request)) <= 0)
        {
            ERR_print_errors_fp(stderr);
            print_err("Unable to send request.");
            ReleaseMutex(req_mutex);
            break;
        }

        // recive response
        if ((nbytes = SSL_read(ssl, response, sizeof(response))) <= 0)
        {
            ERR_print_errors_fp(stderr);
            print_err("No response. (nbytes=%d)", nbytes);
            ReleaseMutex(req_mutex);
            break;
        }
        response[nbytes] = 0;

        puts(response);

        ReleaseMutex(req_mutex);
    }

    if (h_comm) CloseHandle(h_comm);
    coms[n_thread] = 0;

    printf("THREAD %d | Execution terminated.\n", n_thread);
}

DWORD __print_err(const char *msg, va_list argptr) {
    DWORD err_code = GetLastError();
    
    if (!err_code)
    {
        vfprintf(stderr, msg, argptr);
        fprintf(stderr,"\n");
        return EXIT_FAILURE;
    }

    LPTSTR lp_err_descr_buf;

    FormatMessage(FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM |
                      FORMAT_MESSAGE_IGNORE_INSERTS,
                  NULL, err_code, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
                  (LPTSTR)&lp_err_descr_buf, 0, NULL);
    
    if(!lp_err_descr_buf) {
        vfprintf(stderr, msg, argptr);
        fprintf(stderr,"\n");
        return EXIT_FAILURE;
    }

    size_t msg_len = strlen(msg) + strlen(argptr) + 1;
    char *formatted_msg = (char *)malloc(msg_len);

    vsnprintf_s(formatted_msg, msg_len, msg_len, msg, argptr);

    fprintf(stderr, "%s: %s\n", formatted_msg, lp_err_descr_buf);

    free(formatted_msg);
    LocalFree(lp_err_descr_buf);
    return err_code;
}

void print_err(const char *msg, ...) {
    va_list argptr;
    va_start(argptr, msg);
    __print_err(msg, argptr);
    va_end(argptr);
}

void throw_err(const char *msg, ...)
{
    va_list argptr;
    va_start(argptr, msg);
    DWORD err_code = __print_err(msg, argptr);
    va_end(argptr);
    exit(err_code);
}

BOOL find_serial_port(int n_thread, HANDLE *h_comm)
{
    char com_port_name[16];
    BOOL port_taken = FALSE;

    for (int i = 33; i < N_COM; i++)
    {
        port_taken = FALSE;

        for (int j = 0; j < NDEVS; j++)
        {
            if (coms[j] == i)
            {
                port_taken = TRUE;
                break;
            }
        }

        if (port_taken)
            continue;

        _snprintf_s(com_port_name, sizeof(com_port_name), sizeof(com_port_name), COM_PORT_FORMAT, i);

        *h_comm = CreateFile(
            com_port_name,
            GENERIC_READ | GENERIC_WRITE,
            0,
            NULL,
            OPEN_EXISTING,
            FILE_ATTRIBUTE_NORMAL,
            NULL);

        if (*h_comm != INVALID_HANDLE_VALUE)
        {
            coms[n_thread] = i;
            // printf("THREAD %d | Found available serial device %s.\n", n_thread, com_port_name);
            return TRUE;
        }

        CloseHandle(*h_comm);
    }

    // print_err("find_serial_port | Not available serial port");
    return FALSE;
}

BOOL open_serial_port(int n_thread, HANDLE *h_comm, DWORD *event_mask)
{
    if (!find_serial_port(n_thread, h_comm))
    {
        coms[n_thread] = 0;
        if(*h_comm) CloseHandle(*h_comm);
        // print_err("open_serial_port | find_serial_port");
        return FALSE;
    }
    
    if (!FlushFileBuffers(*h_comm))
    {
        coms[n_thread] = 0;
        if(*h_comm) CloseHandle(*h_comm);
        print_err("open_serial_port | FlushFileBuffer");
        return FALSE;
    }

    DCB dcb_serial_params = {0}; // Initializing DCB structure
    dcb_serial_params.DCBlength = sizeof(dcb_serial_params);

    if (!GetCommState(*h_comm, &dcb_serial_params))
    {
        coms[n_thread] = 0;
        if(*h_comm) CloseHandle(*h_comm);
        print_err("init_scanner | GetComState");
        return FALSE;
    }

    dcb_serial_params.BaudRate = CBR_9600;   // Setting BaudRate = 9600
    dcb_serial_params.ByteSize = 8;          // Setting ByteSize = 8
    dcb_serial_params.StopBits = ONESTOPBIT; // Setting StopBits = 1
    dcb_serial_params.Parity = NOPARITY;     // Setting Parity = None

    if (!SetCommState(*h_comm, &dcb_serial_params))
    {
        coms[n_thread] = 0;
        if(*h_comm) CloseHandle(*h_comm);
        print_err("init_scanner | SetComState");
        return FALSE;
    }

    COMMTIMEOUTS timeouts = {0};
    timeouts.ReadIntervalTimeout = MAXDWORD;
    timeouts.ReadTotalTimeoutConstant = 0;
    timeouts.ReadTotalTimeoutMultiplier = 0;
    timeouts.WriteTotalTimeoutConstant = 0;
    timeouts.WriteTotalTimeoutMultiplier = 0;

    if (!SetCommTimeouts(*h_comm, &timeouts))
    {
        coms[n_thread] = 0;
        if(*h_comm) CloseHandle(*h_comm);
        print_err("init_scanner | SetComTimeouts");
        return FALSE;
    }

    *event_mask = (DWORD)EV_RXCHAR;
    if (!SetCommMask(*h_comm, *event_mask))
    {
        coms[n_thread] = 0;
        if(*h_comm) CloseHandle(*h_comm);
        print_err("init_scanner | SetCommMask");
        return FALSE;
    }

    printf("THREAD %d | Connected serial device.\n", n_thread);

    return TRUE;
}

BOOL read_scanner(HANDLE h_comm, DWORD dw_event_mask, char *buf, size_t size)
{

    if (!WaitCommEvent(h_comm, &dw_event_mask, NULL))
    {
        print_err("read_scanner | WaitCommEvent");
        CloseHandle(h_comm);
        return FALSE;
    }

    char tmp_ch = 0;
    DWORD bytes_read;
    int i = 0;

    memset(buf, 0, size);

    do
    {
        if (!ReadFile(h_comm, &tmp_ch, sizeof(tmp_ch), &bytes_read, NULL))
        {
            print_err("read_scanner | ReadFile");
            CloseHandle(h_comm);
            return FALSE;
        }

        if (bytes_read)
            buf[i++] = tmp_ch;
    } while (bytes_read);

    return TRUE;
}

SOCKET conn_to_server(const char *hostname, int port)
{
    WSADATA wsa;
    SOCKET sock;

    if (WSAStartup(MAKEWORD(2, 2), &wsa) != NO_ERROR)
    {
        throw_err("conn_to_server | WSAStartup. Failed. Error Code : %d.", WSAGetLastError());
    }

    // Create a socket
    if ((sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)) == INVALID_SOCKET)
    {
        print_err("Could not create socket : %d.", WSAGetLastError());
        WSACleanup();
        throw_err("conn_to_server | socket");
    }

    // set socket options
    struct sockaddr_in serv_addr;
    memset(&serv_addr, 0, sizeof(serv_addr));
    serv_addr.sin_addr.s_addr = inet_addr(hostname);
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(port);

    printf("Attempt connection to %s:%d.\n", hostname, port);

    // loop while connection is not enstablished
    int connected;
    do
    {
        // connect to server
        // if connection failed retry to connect after 1 sec
        if ((connected = connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr))) == SOCKET_ERROR)
        {
            print_err("Connection to server failed. Error %d", WSAGetLastError());
            Sleep(1000);
        }
    } while (connected == SOCKET_ERROR);

    printf("Connection to %s:%d enstablished.\n", hostname, port);

    return sock;
}

SSL_CTX *init_CTX()
{
    OpenSSL_add_all_algorithms(); /* Load cryptos, et.al. */
    SSL_load_error_strings();     /* Bring in and register error messages */

    const SSL_METHOD *method = TLS_client_method(); /* Create new client-method instance */
    SSL_CTX *ctx = SSL_CTX_new(method);             /* Create new context */
    if (ctx == NULL)
    {
        ERR_print_errors_fp(stderr);
        throw_err("init_CTX | SSL_CTX_new");
    }

    return ctx;
}

void show_certs(SSL *ssl)
{
    char *line;

    X509 *cert = SSL_get_peer_certificate(ssl); /* get the server's certificate */
    if (cert == NULL)
    {
        puts("Info: No client certificates configured.");
        return;
    }

    puts("Server certificates:");
    line = X509_NAME_oneline(X509_get_subject_name(cert), 0, 0);
    printf("Subject: %s\n", line);
    free(line); /* free the malloc'ed string */
    line = X509_NAME_oneline(X509_get_issuer_name(cert), 0, 0);
    printf("Issuer: %s\n", line);
    free(line);      /* free the malloc'ed string */
    X509_free(cert); /* free the malloc'ed certificate copy */
}
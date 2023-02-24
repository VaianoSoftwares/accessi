#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <termios.h>
#include <dirent.h>
#include <errno.h>
#include <fcntl.h>
#include <stdbool.h>
#include <string.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <netdb.h>
#include <sys/wait.h>
#include <pthread.h>
#include <openssl/ssl.h>
#include <openssl/err.h>
#include "scanner.h"

static open_devs_t od;

static pthread_mutex_t scan_mutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t req_mutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t start_mutex = PTHREAD_MUTEX_INITIALIZER;

void create_threads(pthread_t *threads, int *irets, tparams_t *tparams);
void *thread_run(void *targs);
void wait_threads(pthread_t *threads, int *irets);
bool find_scanner(int n_thread);
int connect_scanner(char *dev_name, struct termios *tio);
int conn_to_server(const char *hostname, uint16_t port);
void __print_err(const char *msg, va_list args);

int main(int argc, char *argv[]) {
    puts("MAIN | Execution started.");

    if(argc < 2) throw_err("MAIN | invalid arguments: token is missing");

    // get cmd args
    char *token = argv[1];

    char *hostname = (argc >= 3 && strlen(argv[2]) > 0) ? argv[2] : DEFAULT_HOSTNAME;
    uint16_t port = (argc >= 6 && atoi(argv[5]) > 0) ? atoi(argv[6]) : DEFAULT_PORT;

    body_args_t ba;
    ba.cliente = (argc >= 5 && strlen(argv[4]) > 0) ? argv[4] : DEFAULT_CLIENTE;
    ba.postazione = (argc >= 4 && strlen(argv[3]) > 0) ? argv[3] : DEFAULT_CLIENTE;
    ba.barcode = NULL;

    int body_len = strlen(BODY_FORMAT) + strlen(ba.cliente) +
                   strlen(ba.postazione) + SCAN_BUF_SIZE;
    int req_len =
        strlen(MSG_FORMAT) + body_len + strlen(hostname) + strlen(token);
    
    /*#################################################################################################################*/

    SSL_library_init();

    SSL_CTX *ctx = init_CTX();

    // connect to server
    int client_fd = conn_to_server(hostname, port);
    printf("MAIN | Connection to %s:%d enstablished.\n", hostname, port);

    // make ssl connection
    SSL *ssl = SSL_new(ctx);
    SSL_set_fd(ssl, client_fd);
    if(SSL_connect(ssl) == INVALID_FD) {
        ERR_print_errors_fp(stderr);
        throw_err("MAIN | SSL_connect");
    }

    puts("MAIN | SSL connection enstablished.");

    show_certs(ssl);

    /*#################################################################################################################*/

    // init open_devs
    bzero(od, sizeof(od));
    
    // params for threads
    tparams_t tparams;
    tparams.ba = &ba;
    tparams.body_len = body_len;
    tparams.hostname = hostname;
    tparams.req_len = req_len;
    tparams.ssl = ssl;
    tparams.token = token;
    tparams.n_thread = 0;

    pthread_t threads[NDEVS];
    int irets[NDEVS];

    // create threads
    create_threads(threads, irets, &tparams);

    // wait for threads to terminate
    puts("MAIN | Wait for threads to terminate.");
    wait_threads(threads, irets);

    /*#################################################################################################################*/

    SSL_free(ssl);
    close(client_fd);
    SSL_CTX_free(ctx);

    puts("MAIN | Execution terminated.");

    return EXIT_SUCCESS;
}

void create_threads(pthread_t *threads, int *irets, tparams_t *tparams) {
    pthread_mutex_lock(&start_mutex);
    for(int i=0; i<NDEVS; i++) {
        if((irets[i] = pthread_create(&threads[i], NULL, thread_run,(void *)tparams)))
            throw_err("create_threads | pthread_create");
        printf("MAIN | Created THREAD %d.\n", i);
        pthread_mutex_lock(&start_mutex);
        tparams->n_thread++;
    }
}

void wait_threads(pthread_t *threads, int *irets) {
    for(int i=0; i<NDEVS; i++) {
        pthread_join(threads[i], NULL);
        printf("MAIN | THREAD %d returns: %d.\n", i, irets[i]);
    }
}

void *thread_run(void *targs) {
    // gather thread params
    tparams_t *tparams = (tparams_t *)targs;

    int n_thread = tparams->n_thread;

    printf("THREAD %d | Execution started.\n", n_thread);

    pthread_mutex_unlock(&start_mutex);

    body_args_t *ba = tparams->ba;

    const char *token = tparams->token;
    const char *hostname = tparams->hostname;

    SSL *ssl = tparams->ssl;

    int body_len = tparams->body_len;
    int req_len = tparams->req_len;

    /*#################################################################################################################*/

    struct termios tio;
    int scan_fd;
    ssize_t read_scan;

    char request[req_len], response[MSG_LEN], body_msg[body_len], scan_buf[SCAN_BUF_SIZE];
    int nbytes;

    while(true) {
        if(!od[n_thread].open) {
            pthread_mutex_lock(&scan_mutex);

            // search for an available scanner device
            if(!find_scanner(n_thread)) {
                od[n_thread].open = false;
                // fprintf(stderr, RED "THREAD %d | Scanner not found.\n" RESET, n_thread);
                pthread_mutex_unlock(&scan_mutex);
                sleep(5);
                continue;
            }

            printf("THREAD %d | Available scanner device %s has been found.\n", n_thread, od[n_thread].pathname);

            // connetc serial scanner
            if((scan_fd = connect_scanner(od[n_thread].pathname, &tio)) == INVALID_FD) {
                print_err("THREAD %d | Failed to open scanner %s.", n_thread, od[n_thread].pathname);
                close(scan_fd);
                od[n_thread].open = false;
                pthread_mutex_unlock(&scan_mutex);
                sleep(5);
                continue;
            }

            printf("THREAD %d | Scanner %s has been connected.\n", n_thread, od[n_thread].pathname);

            pthread_mutex_unlock(&scan_mutex);
        }
        
        // get barcode
        printf("THREAD %d | Waiting for scanner input.\n", n_thread);
        while((read_scan = read(scan_fd, scan_buf, sizeof(scan_buf))) < 0);
        if (!read_scan) {
            print_err("THREAD %d | Scanner %s has been unplugged.", n_thread, od[n_thread].pathname);
            close(scan_fd);
            od[n_thread].open = false;
            continue;
        }

        // create msg request
        snprintf(body_msg, sizeof(body_msg), BODY_FORMAT, scan_buf,
                 ba->cliente, ba->postazione);
        snprintf(request, sizeof(request), MSG_FORMAT, hostname, token,
                 strlen(body_msg), body_msg);

        pthread_mutex_lock(&req_mutex);

        puts("-------------------------------------------------------------"
               "--------------------------------------");
        puts(request);
        puts("-------------------------------------------------------------"
               "--------------------------------------");

        // send request
        if (SSL_write(ssl, request, strlen(request)) <= 0)
        {
            ERR_print_errors_fp(stderr);
            fprintf(stderr, RED "THREAD %d | SSL_write: Unable to send request.\n" RESET, n_thread);
            pthread_mutex_unlock(&req_mutex);
            break;
        }

        // recive response
        if ((nbytes = SSL_read(ssl, response, sizeof(response))) <= 0)
        {
            ERR_print_errors_fp(stderr);
            fprintf(stderr, RED "THREAD %d | SSL_read: No response.\n" RESET, n_thread);
            pthread_mutex_unlock(&req_mutex);
            break;
        }
        response[nbytes] = 0;

        puts(response);

        pthread_mutex_unlock(&req_mutex);
    }

    close(scan_fd);
    od[n_thread].open = false;
    printf("THREAD %d | Execution terminated.\n", n_thread);

    return NULL;
}

void __print_err(const char *msg, va_list args) {
    size_t msg_size = strlen(msg) + strlen((char *)args) + 1;
    char *formatted_msg = (char *)malloc(msg_size);
    vsnprintf(formatted_msg, msg_size, msg, args);

    if(!errno) {
        fprintf(stderr, RED "%s\n" RESET, formatted_msg);
        free(formatted_msg);
        return;
    }
    
    fprintf(stderr, RED);
    perror(formatted_msg);
    fprintf(stderr, RESET);

    free(formatted_msg);
}

void print_err(const char *msg, ...) {
    va_list args;
    va_start(args, msg);
    __print_err(msg, args);
    va_end(args);
}

void throw_err(const char *msg, ...) {
    va_list args;
    va_start(args, msg);
    __print_err(msg, args);
    va_end(args);

    if(!errno) exit(EXIT_FAILURE);
    else exit(errno);
}

bool find_scanner(int n_thread) {
    DIR *dp;
    struct dirent *dir;
    char dev_found[DEVNAME_LEN];
    bool is_open = false;

    // open serial devices directory
    if((dp = opendir(SERIAL_DIR)) == NULL) {
        print_err("Can't open serial devices directory: no device detected.");
        closedir(dp);
        return false;
    }

    // search for a serial device
    while((dir = readdir(dp)) != NULL) {
        // not a char file: fail
        if(dir->d_type != DT_LNK) continue;

        // get device full path
        snprintf(dev_found, sizeof(dev_found), "%s/%s", SERIAL_DIR, dir->d_name);

        is_open = false;

        for(int i=0; i<NDEVS; i++) {
            if(!od[i].open || i == n_thread) continue;

            // device already opened
            if(!strcmp(dev_found, od[i].pathname)) {
                is_open = true;
                break;
            }
        }

        // device not already opened has been found
        if(!is_open) {
            strcpy(od[n_thread].pathname, dev_found);
            od[n_thread].open = true;
            closedir(dp);
            return true;
        }
    }

    closedir(dp);
    od[n_thread].open = false;
    return false;
}

int connect_scanner(char *dev_name, struct termios *tio) {
    // open device on non-blocking read-only
    int fd;
    if((fd = open(dev_name, O_RDONLY | O_NONBLOCK)) == INVALID_FD) {
        print_err("connect_scanner | open");
        close(fd);
        return INVALID_FD;
    }

    // device must be a tty
    if(!isatty(fd)) {
        print_err("connect_scanner | not a tty");
        close(fd);
        return INVALID_FD;
    }

    // serial device setup
    bzero(tio, sizeof(*tio));

    tio->c_iflag= 0;
    tio->c_oflag= 0;
    tio->c_cflag= CS8 | CREAD | CLOCAL;           
    tio->c_lflag= 0;
    tio->c_cc[VMIN]= 1; 
    tio->c_cc[VTIME]= 5;

    cfsetospeed(tio,B9600);
    cfsetispeed(tio,B9600);      
 
    tcsetattr(fd,TCSANOW,tio);

    // printf("Serial device %s connected.\n", dev_name);

    return fd;
}

int conn_to_server(const char *hostname, uint16_t port) {
    int sd;
    struct hostent *host;
    struct sockaddr_in addr;

    // get hostname
    if((host = gethostbyname(hostname)) == NULL)
        throw_err("conn_to_server | gethostbyname");

    // create socket
    if((sd = socket(PF_INET, SOCK_STREAM, 0)) == INVALID_FD)
        throw_err("conn_to_server | socket");
    
    bzero(&addr, sizeof(addr));

    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = *(long*)(host->h_addr_list[0]);

    printf("Attempt to connect to %s:%d.\n", hostname, port);

    //attempt to connect
    while(connect(sd, (struct sockaddr*)&addr, sizeof(addr)))
        sleep(1);

    // printf("Connection to %s:%d enstablished.\n", hostname, port);

    return sd;
}

SSL_CTX* init_CTX() {   
    OpenSSL_add_all_algorithms();  /* Load cryptos, et.al. */
    SSL_load_error_strings();   /* Bring in and register error messages */

    const SSL_METHOD *method = TLS_client_method();  /* Create new client-method instance */
    SSL_CTX *ctx = SSL_CTX_new(method);   /* Create new context */
    if(ctx == NULL) {
        ERR_print_errors_fp(stderr);
        throw_err("init_CTX | SSL_CTX_new");
    }

    return ctx;
}

void show_certs(SSL *ssl) {
    char *line;

    X509 *cert = SSL_get_peer_certificate(ssl); /* get the server's certificate */
    if(cert == NULL) {
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
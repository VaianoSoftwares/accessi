#define DEFAULT_HOSTNAME "127.0.0.1"
#define DEFAULT_PORT 4316
#define MSG_LEN 4096
#define TOKEN_MAX_LEN 1024

#define LOGIN_MSG_FMT "POST /api/v1/users/user/login HTTP/1.1\r\n"        \
                      "Host: %s\r\n"                                      \
                      "Content-Type: application/json; charset=utf-8\r\n" \
                      "Content-Length: %d\r\n\r\n"                        \
                      "%s"

#define LOGIN_BODY_FMT "{\"name\":\"%s\",\"password\":\"%s\"}"

#define TIMBRA_MSG_FMT "POST /api/v1/badges/archivio HTTP/1.1\r\n"         \
                       "Host: %s\r\n"                                      \
                       "x-access-token: %s\r\n"                            \
                       "Content-Type: application/json; charset=utf-8\r\n" \
                       "Content-Length: %zd\r\n\r\n"                       \
                       "%s"

#define TIMBRA_BODY_FMT "{\"barcode\":\"%s\",\"postazioneId\":\"%s\"}"

#define SCAN_BUF_SIZE 32
#define N_SCAN_TIMBRA 2
#define N_SCAN_CHIAVI 1
#define NDEVS (N_SCAN_TIMBRA + N_SCAN_CHIAVI)

typedef struct login_req_t
{
    char *username;
    char *password;
} login_req_t;

typedef struct scan_buf_t
{
    char (*array)[SCAN_BUF_SIZE];
    size_t max_size;
    size_t size;
} scan_buf_t;

typedef enum scan_t
{
    TIMBRA,
    CHIAVE
} scan_t;

typedef struct thread_params_t
{
    const char *token;
    const char *postazione_id;
    const char *hostname;
    SSL *ssl;
    int body_len;
    int req_len;
    int n_thread;
    scan_t scan_type;
} tparams_t;

#ifdef SCAN_LINUX

#define INVALID_FD -1

#define RED "\e[1;31m"
#define RESET "\e[0m"

#define SERIAL_DIR "/dev/serial/by-id"
#define DEVNAME_LEN (256 + sizeof(SERIAL_DIR))

typedef struct open_dev_t
{
    char pathname[DEVNAME_LEN];
    bool open;
    scan_t scan_type;
} open_dev_t;

typedef open_dev_t open_devs_t[NDEVS];

#endif /* SCAN_LINUX */

#ifdef SCAN_WIN

#define COM_PORT_FORMAT "\\\\.\\COM%d"
#define N_COM 256

#endif /* SCAN_WIN */

void print_err(const char *msg, ...);
void throw_err(const char *msg, ...);

SSL_CTX *init_CTX();
void show_certs(SSL *ssl);
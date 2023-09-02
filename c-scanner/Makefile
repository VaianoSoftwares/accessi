cc = gcc
cc_win = x86_64-w64-mingw32-g++

libs = -lssl -lcrypto -lpthread
libs_win = -lssl -lcrypto -lws2_32

win_incl_path = -I/usr/x86_64-w64-mingw32/include/openssl-1.1
win_lib_path = -L/usr/x86_64-w64-mingw32/lib/openssl-1.1

wine_dll_path = /usr/x86_64-w64-mingw32/bin

run_args = `cat token.txt` `cat postazione.txt`

all: scanner scanner-win.exe

scanner: 
	${cc} -Wall -DSCAN_LINUX -o $@ scanner.c ${libs}

scanner-win.exe:
	${cc_win} -Wall -DSCAN_WIN -o $@ scanner-win.c ${win_incl_path} ${win_lib_path} ${libs_win}

clean:
	rm scanner scanner-win.exe

run: scanner
	sudo ./scanner ${run_args}

run-win: scanner-win.exe
	sudo WINEPATH=${wine_dll_path} wine scanner-win.exe ${run_args}
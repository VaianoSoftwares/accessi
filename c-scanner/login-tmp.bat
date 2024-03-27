@echo off
curl -k -D "%USERPROFILE%\\out.txt" -H "Content-Type: application/json; charset=utf-8" -d "{\"name\":\"%COMPUTERNAME%\",\"password\":\"%COMPUTERNAME%123\"}" "https://accessi.duckdns.org/api/v1/users/login/tmp" > NUL
FOR /F "tokens=2 delims= " %%i IN ('findstr "x-access-token: " %USERPROFILE%\\out.txt') do set "token=%%i"
"C:\\Program Files\\LibreWolf\\librewolf.exe" "https://accessi.duckdns.org/login/#%token%"
browser=`which chromium`
base_url="https://localhost:4316"
username="$HOSTNAME"
password="password1"
headers_file="/tmp/headers.txt"

browser=("${browser}")

curl -k -v -D "$headers_file" \
-H "Content-Type: application/json; charset=utf-8" \
-d "{\"name\":\"$username\", \"password\":\"$password\"}" \
"${base_url}/api/v1/users/login/tmp" &> /dev/null

token=$(cat "$headers_file" | grep "x-access-token:" | head -1 | tr -d '\n' | tr -d '\r' | cut -d" " -f2)

"${browser[@]}" "${base_url}/login/#${token}" &> /dev/null &
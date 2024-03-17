#!/usr/bin/env bash
set -euo pipefail

browser="${3:=`which chromium`}"
base_url="${2:="https://localhost:4316"}"
username="${4:="$HOSTNAME"}"
password="${1:="password1"}"

headers_file=$(mktemp)
trap "rm -f $headers_file" EXIT

browser=("${browser}")

curl -k -v -D "$headers_file" \
-H "Content-Type: application/json; charset=utf-8" \
-d "{\"name\":\"$username\", \"password\":\"$password\"}" \
"${base_url}/api/v1/users/login/tmp" &> /dev/null

token=$(cat "$headers_file" | grep "x-access-token:" | head -1 | tr -d '\n' | tr -d '\r' | cut -d" " -f2)

"${browser[@]}" "${base_url}/login/#${token}" &> /dev/null &
#!/usr/bin/env bash
set -euo pipefail

browser="${2:-`which chromium`}"
base_url="${1:-"https://localhost:4317"}"
username="${3:-"$HOSTNAME"}"

headers_file=$(mktemp)
trap "rm -f $headers_file" EXIT

browser=("${browser}")

curl -k -v -D "$headers_file" \
-H "Content-Type: application/json; charset=utf-8" \
-d "{\"name\":\"$username\", \"password\":\"${username}123\"}" \
"${base_url}/api/v1/users/login/tmp" &> /dev/null

token=$(cat "$headers_file" | grep "x-access-token:" | head -1 | tr -d '\n' | tr -d '\r' | cut -d" " -f2)

"${browser[@]}" "${base_url}/login/#${token}" &> /dev/null &
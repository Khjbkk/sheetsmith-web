#!/usr/bin/env bash
# IndexNow submission — pushes all URLs from sitemap to Bing/Yandex/Seznam IndexNow API
# Run after Bing Webmaster Tools verifies the key file at:
#   https://sheetsmith.org/60b8a8c86a09b5eda70402b28e5e53cb.txt
#
# Usage: bash tools/submit_indexnow.sh
set -euo pipefail

HOST="sheetsmith.org"
KEY="60b8a8c86a09b5eda70402b28e5e53cb"
KEY_LOCATION="https://${HOST}/${KEY}.txt"
SITEMAP="https://${HOST}/sitemap-0.xml"

echo "Fetching URLs from ${SITEMAP}..."
URLS=$(curl -s "${SITEMAP}" | grep -oE 'https://[^<]+' | sort -u)
URL_COUNT=$(echo "${URLS}" | wc -l | tr -d ' ')
echo "Found ${URL_COUNT} URLs"

# Build JSON urlList
URL_JSON=$(echo "${URLS}" | python3 -c 'import sys,json; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))')

PAYLOAD=$(python3 -c "
import json
print(json.dumps({
    'host': '${HOST}',
    'key': '${KEY}',
    'keyLocation': '${KEY_LOCATION}',
    'urlList': ${URL_JSON}
}))
")

echo "Submitting to api.indexnow.org..."
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "${PAYLOAD}" \
  -w "\nHTTP %{http_code}\n"
echo "Done. Expected codes: 200 OK | 202 Accepted | 400 Bad Request | 403 Forbidden (key not verified yet) | 422 Unprocessable | 429 Too Many."

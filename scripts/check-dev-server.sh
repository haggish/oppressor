#!/usr/bin/env bash
# Smoke test: start the Quasar dev server, check it serves the app and
# transforms source modules, and make sure it doesn't crash shortly after
# startup (e.g. vite-plugin-checker failing in its worker).
#
# Usage: scripts/check-dev-server.sh [port]   (default port 9100)
set -uo pipefail

PORT="${1:-9100}"
BASE="http://localhost:${PORT}"
STARTUP_TIMEOUT=90   # seconds to wait for the first successful response
SETTLE_TIME=10       # seconds the server must stay alive after it responds
LOG="$(mktemp)"

bunx quasar dev --port "$PORT" >"$LOG" 2>&1 &
PID=$!

cleanup() {
  kill "$PID" 2>/dev/null
  wait "$PID" 2>/dev/null
  rm -f "$LOG"
}
trap cleanup EXIT

fail() {
  echo "❌ Dev server check failed: $1"
  echo "----- quasar dev output -----"
  sed 's/\x1b\[[0-9;]*m//g' "$LOG"
  exit 1
}

alive() { kill -0 "$PID" 2>/dev/null; }

status() { curl -s -o /dev/null -w '%{http_code}' "$BASE$1"; }

# 1. Wait for the server to come up (or die).
for ((i = 0; i < STARTUP_TIMEOUT; i++)); do
  alive || fail "process exited during startup"
  [[ "$(status /)" == "200" ]] && break
  sleep 1
done
[[ "$(status /)" == "200" ]] || fail "no HTTP 200 on / within ${STARTUP_TIMEOUT}s"

# 2. Vite must be able to transform real source modules.
for path in /src/router/index.ts /src/router/routes.ts /src/stores/deviceStore.ts /src/boot/pinia.ts; do
  code="$(status "$path")"
  [[ "$code" == "200" ]] || fail "GET $path returned HTTP $code"
done

# 3. Some failures (like plugin workers crashing) happen just after startup.
sleep "$SETTLE_TIME"
alive || fail "process exited within ${SETTLE_TIME}s of serving requests"
[[ "$(status /)" == "200" ]] || fail "server stopped responding after ${SETTLE_TIME}s"

echo "✅ Dev server started and served the app on port ${PORT}"

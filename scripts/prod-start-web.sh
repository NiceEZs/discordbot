#!/usr/bin/env bash
# Start produkcyjny panelu Next.js na :3001 (3000 = Cloudflare u Nice).
set -euo pipefail

# shellcheck disable=SC1091
. "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_node
require_env_file

export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3001}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

if [[ ! -d "$ROOT/apps/web/.next" ]]; then
  echo "Błąd: brak apps/web/.next — najpierw uruchom: bash scripts/prod-build.sh" >&2
  exit 1
fi

NEXT_BIN="$ROOT/node_modules/.bin/next"
if [[ ! -x "$NEXT_BIN" ]]; then
  NEXT_BIN="$ROOT/apps/web/node_modules/.bin/next"
fi
if [[ ! -x "$NEXT_BIN" ]]; then
  echo "Błąd: nie znaleziono next w node_modules — uruchom: bash scripts/prod-build.sh" >&2
  exit 1
fi

echo "==> Start panelu: hostname=$HOSTNAME port=$PORT ($NEXT_BIN)"
cd "$ROOT/apps/web"
exec "$NEXT_BIN" start --hostname "$HOSTNAME" --port "$PORT"

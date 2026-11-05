#!/usr/bin/env bash
# Start produkcyjny procesu bota (używane przez systemd).
set -euo pipefail

# shellcheck disable=SC1091
. "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_node
require_env_file

export NODE_ENV="${NODE_ENV:-production}"

BOT_ENTRY="$ROOT/apps/bot/dist/index.js"
if [[ ! -f "$BOT_ENTRY" ]]; then
  echo "Błąd: brak $BOT_ENTRY — najpierw uruchom: bash scripts/prod-build.sh" >&2
  exit 1
fi

echo "==> Start bota: $BOT_ENTRY"
exec node "$BOT_ENTRY"

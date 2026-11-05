#!/usr/bin/env bash
# Buduje db + bot + panel do produkcji (bez sekretów w argumencie).
# Użycie (z katalogu ~/discordbot):
#   bash scripts/prod-build.sh
set -euo pipefail

# shellcheck disable=SC1091
. "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_node
require_env_file

echo "==> Katalog: $ROOT"
echo "==> Node: $(node -v)  npm: $(npm -v)"

if [[ -f package-lock.json ]]; then
  echo "==> npm ci"
  npm ci
else
  echo "==> npm install (brak package-lock.json)"
  npm install
fi

echo "==> npm run build (db → bot → web)"
npm run build

echo "==> Build OK."

#!/usr/bin/env bash
# Bezpieczna synchronizacja schematu Prisma na produkcji.
#
# Domyślnie: prisma migrate deploy (tylko stosuje istniejące migracje — bez resetu).
# Opcjonalnie: --push → prisma db push (bez --force-reset; tylko gdy świadomie
#              nie używasz historii migracji / pierwszy sync MVP).
#
# Użycie:
#   bash scripts/prod-db.sh
#   bash scripts/prod-db.sh --push
set -euo pipefail

# shellcheck disable=SC1091
. "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_node
require_env_file

MODE="migrate"
if [[ "${1:-}" == "--push" ]]; then
  MODE="push"
elif [[ -n "${1:-}" ]]; then
  echo "Użycie: $0 [--push]" >&2
  exit 1
fi

echo "==> Katalog: $ROOT"
echo "==> Generuję klienta Prisma"
npm run db:generate

if [[ "$MODE" == "migrate" ]]; then
  echo "==> prisma migrate deploy (bezpieczne na produkcji)"
  npm run db:migrate:deploy
else
  echo "==> prisma db push (bez force-reset; świadomy tryb MVP)"
  npm run db:push
fi

echo "==> Baza OK ($MODE)."

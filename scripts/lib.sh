#!/usr/bin/env bash
# Wspólne helpery dla skryptów produkcyjnych (bez sekretów).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

load_node() {
  # systemd nie ładuje nvm — dołącz jeśli jest w HOME użytkownika usługi
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    export NVM_DIR="${NVM_DIR:-${HOME}/.nvm}"
    # shellcheck disable=SC1091
    if [[ -s "${NVM_DIR}/nvm.sh" ]]; then
      . "${NVM_DIR}/nvm.sh"
    fi
  fi

  if ! command -v node >/dev/null 2>&1; then
    echo "Błąd: nie znaleziono node w PATH. Zainstaluj Node 20+ (np. NodeSource lub nvm)." >&2
    exit 1
  fi
  if ! command -v npm >/dev/null 2>&1; then
    echo "Błąd: nie znaleziono npm w PATH." >&2
    exit 1
  fi
}

require_env_file() {
  if [[ ! -f "$ROOT/.env" ]]; then
    echo "Błąd: brak pliku $ROOT/.env — skopiuj .env.example i uzupełnij sekrety lokalnie (nie w git)." >&2
    exit 1
  fi
}

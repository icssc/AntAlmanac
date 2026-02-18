#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

NODE_MAJOR_MIN=22
PNPM_MAJOR_MIN=10
START_DEV=true

for arg in "$@"; do
    case "$arg" in
    --setup-only)
        START_DEV=false
        ;;
    --dev)
        START_DEV=true
        ;;
    --help|-h)
        cat <<'EOF'
Usage: ./start.sh [--setup-only] [--dev]

Options:
  --setup-only  Run setup steps and exit without starting dev server
  --dev         Run setup steps and start dev server (default)
EOF
        exit 0
        ;;
    *)
        echo "Unknown option: $arg"
        echo "Run ./start.sh --help for usage."
        exit 1
        ;;
    esac
done

log() {
    echo "[start.sh] $*"
}

require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Missing required command: $1"
        exit 1
    fi
}

check_major_version() {
    local command_name="$1"
    local version_arg="$2"
    local min_major="$3"
    local raw_version
    local major

    raw_version="$("$command_name" "$version_arg" | head -n 1)"
    major="$(echo "$raw_version" | sed -E 's/[^0-9]*([0-9]+).*/\1/')"

    if [[ -z "$major" || ! "$major" =~ ^[0-9]+$ ]]; then
        echo "Could not parse $command_name version from: $raw_version"
        exit 1
    fi

    if (( major < min_major )); then
        echo "$command_name version $raw_version is too old. Need major >= $min_major."
        exit 1
    fi
}

copy_env_if_missing() {
    local src="$1"
    local dest="$2"
    if [[ ! -f "$dest" ]]; then
        cp "$src" "$dest"
        log "Created $dest from $src"
    else
        log "Found existing $dest (leaving as-is)"
    fi
}

log "Checking required tools"
require_command node
require_command pnpm
require_command docker
check_major_version node --version "$NODE_MAJOR_MIN"
check_major_version pnpm --version "$PNPM_MAJOR_MIN"

if ! docker compose version >/dev/null 2>&1; then
    echo "docker compose is required but not available."
    exit 1
fi

log "Ensuring local environment files exist"
copy_env_if_missing "packages/db/.env.example" "packages/db/.env"
copy_env_if_missing "apps/antalmanac/.env.example" "apps/antalmanac/.env"
copy_env_if_missing "apps/aants/.env.example" "apps/aants/.env"

log "Installing dependencies"
pnpm install

log "Starting PostgreSQL container"
docker compose up -d --build

log "Waiting for PostgreSQL container to start"
sleep 5

log "Running database migrations"
pnpm db:migrate

log "Fetching static app data"
pnpm --filter antalmanac get-data

if [[ "$START_DEV" == "true" ]]; then
    log "Starting development server"
    pnpm dev
else
    log "Setup complete. Start dev server with: pnpm dev"
fi
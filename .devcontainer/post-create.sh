#!/usr/bin/env bash
set -euo pipefail

echo "==> Setting up AntAlmanac development environment"

cd "$(git rev-parse --show-toplevel)"

echo "==> Enabling corepack and activating pnpm"
sudo corepack enable
corepack prepare pnpm@10.22.0 --activate

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

copy_env() {
    local example="$1"
    local target="${example%.example}"
    if [ -f "$example" ] && [ ! -f "$target" ]; then
        cp "$example" "$target"
        echo "    created $target"
    fi
}

echo "==> Seeding .env files from .env.example"
copy_env apps/antalmanac/.env.example
copy_env apps/aants/.env.example
copy_env packages/db/.env.example

echo "==> Starting PostgreSQL via docker compose"
docker compose up -d --build

echo "==> Waiting for PostgreSQL to be ready"
db_ready=false
for _ in {1..30}; do
    if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
        db_ready=true
        echo "    PostgreSQL is ready"
        break
    fi
    sleep 1
done

if [ "$db_ready" = false ]; then
    echo "    PostgreSQL did not become ready within 30s — skipping migrations and data fetch."
    echo "    Check 'docker compose logs db', then rerun 'pnpm db:migrate' and"
    echo "    '(cd apps/antalmanac && pnpm get-data)' once the database is up."
    exit 0
fi

echo "==> Running database migrations"
pnpm db:migrate || echo "    db:migrate failed — you can rerun it manually"

echo "==> Fetching static course data (this can take a minute)"
(cd apps/antalmanac && pnpm get-data) || echo "    get-data failed — you can rerun it manually from apps/antalmanac"

cat <<'EOF'

============================================================
AntAlmanac dev environment is ready.

Start the dev server with:
    pnpm dev

Then open the forwarded port 3000 to view the site.

Useful commands:
    pnpm dev          Start the Next.js dev server
    pnpm test         Run the test suite
    pnpm db:studio    Open Drizzle Studio for the local DB
    pnpm db:migrate   Re-run database migrations
============================================================
EOF

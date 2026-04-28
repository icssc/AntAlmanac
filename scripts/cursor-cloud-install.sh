#!/usr/bin/env bash
set -euo pipefail

pnpm install --frozen-lockfile

env_file="apps/antalmanac/.env"

if [[ ! -f "$env_file" ]]; then
    cp apps/antalmanac/.env.example "$env_file"
fi

ensure_env_var() {
    local key="$1"
    local value="$2"

    while IFS= read -r line; do
        [[ "$line" == "$key="* ]] && return
    done < "$env_file"

    printf '%s=%s\n' "$key" "$value" >> "$env_file"
}

ensure_env_var "STAGE" "local"
ensure_env_var "MAPBOX_ACCESS_TOKEN" ""
ensure_env_var "ANTEATER_API_KEY" ""
ensure_env_var "DB_URL" "\"postgres://postgres:postgres@localhost:5432/antalmanac\""
ensure_env_var "OIDC_CLIENT_ID" "antalmanac-dev"
ensure_env_var "OIDC_ISSUER_URL" "https://auth.icssc.club"
ensure_env_var "GOOGLE_REDIRECT_URI" "http://localhost:3000/auth"
ensure_env_var "PLANNER_CLIENT_API_KEY" ""

pnpm --filter antalmanac fetch-term-data

if [[ -n "${ANTEATER_API_KEY:-}" ]]; then
    pnpm --filter antalmanac get-data
else
    cat > apps/antalmanac/src/generated/searchData.ts <<'EOF'
import type { CourseSearchResult, DepartmentSearchResult } from "@packages/antalmanac-types";

export const departments: Array<DepartmentSearchResult & { id: string }> = [];
export const courses: Array<CourseSearchResult & { id: string }> = [];
EOF

    echo "ANTEATER_API_KEY is not set; wrote a minimal searchData.ts for build-time imports."
    echo "Run 'pnpm --filter antalmanac get-data' with ANTEATER_API_KEY to generate full search caches."
fi

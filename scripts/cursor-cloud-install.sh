#!/usr/bin/env bash
set -euo pipefail

pnpm install --frozen-lockfile

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

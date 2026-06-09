# AGENTS.md

## Cursor Cloud specific instructions

AntAlmanac is a **pnpm monorepo** (Node.js ≥ 22, pnpm 10). The primary product is the Next.js app in `apps/antalmanac`.

### Services

| Service | Command | Notes |
|---------|---------|-------|
| PostgreSQL | `sudo docker compose up -d --build` | Port 5432; credentials in `docker-compose.yml` |
| Web app | `pnpm dev` | http://localhost:3000 |

Docker must be running (`sudo service docker start` if needed). The VM uses `fuse-overlayfs` as the Docker storage driver.

### First-time local setup (after `pnpm install`)

1. Copy env templates: `apps/antalmanac/.env.example` → `.env`, `packages/db/.env.example` → `.env`
2. Generate `BETTER_AUTH_SECRET` (any random string) in `apps/antalmanac/.env`
3. Set a valid `ANTEATER_API_KEY` in `apps/antalmanac/.env` (required for `get-data` and live WebSoc)
4. Start Postgres, then apply schema:
   - **Fresh DB:** `cd packages/db && pnpm drizzle-kit push --force` — `pnpm db:migrate` fails on empty databases because Drizzle runs all migrations in one transaction and PostgreSQL rejects enum values used before commit (migration `0020_better_auth.sql`)
   - **Existing DB:** `pnpm db:migrate` works when migrations were applied incrementally
5. Fetch generated data: `cd apps/antalmanac && pnpm get-data` (writes `src/generated/termData.json`, `searchData.json`, and `src/generated/terms/*.json`; gitignored except `departments.json` / `deployed_terms.json`)

### Standard commands (see root `package.json` and `README.md`)

- **Lint:** `pnpm lint`
- **Test:** `pnpm test run` (CI runs `pnpm --filter antalmanac fetch-term-data` first; full `get-data` is needed for dev server)
- **Dev:** `pnpm dev`
- **DB studio:** `pnpm db:studio`

### Gotchas

- `ANTEATER_API_KEY` is mandatory for runtime WebSoc/course data; stub generated JSON only exercises search autocomplete.
- Auth (Google/Apple sign-in) uses external ICSSC OIDC (`OIDC_*` vars in `.env.example`); optional for anonymous browsing.
- `MAPBOX_ACCESS_TOKEN` is optional; map routes 500 without it.
- Husky pre-commit runs `lint-staged` (`pnpm format` + `pnpm lint --fix`); set `HUSKY=0` to skip during bulk installs.

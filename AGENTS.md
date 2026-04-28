# Repository instructions

## Cursor Cloud specific instructions

- Cursor Cloud Agents run `scripts/cursor-cloud-install.sh` from `.cursor/environment.json` before tasks start.
- The install script runs `pnpm install --frozen-lockfile` so workspace dependencies are ready before agent work begins.
- AntAlmanac builds need generated files under `apps/antalmanac/src/generated`, which are ignored except for `deployed_terms.json`.
- `pnpm --filter antalmanac fetch-term-data` generates `apps/antalmanac/src/generated/termData.ts`.
- `pnpm --filter antalmanac get-data` generates `termData.ts`, `searchData.ts`, and `terms/*.json`. It requires `ANTEATER_API_KEY` for the course search cache.
- If `ANTEATER_API_KEY` is unavailable, the Cursor install script still generates `termData.ts` and writes a minimal `searchData.ts` so `pnpm --filter antalmanac build` can resolve build-time imports. Run `ANTEATER_API_KEY=<key> pnpm --filter antalmanac get-data` when testing search behavior or producing deploy-ready caches.
- The install script writes `apps/antalmanac/.env` from `.env.example` when missing so Next can collect route data during `pnpm --filter antalmanac build` in cloud agents. Replace those placeholder values with real secrets before testing API-backed behavior.

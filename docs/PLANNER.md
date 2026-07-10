# AntAlmanac Planner

The AntAlmanac Planner (served at [antalmanac.com/planner](https://antalmanac.com/planner)) lives in this
repository: the scheduler and the planner are one Next.js App Router application.

## Layout

| Path                                             | Contents                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `apps/antalmanac/src/app/planner/`               | Planner routes (`/planner`, `/planner/course/[id]`, `/planner/instructor/[id]`, `/planner/reviews`, `/planner/admin/*`) and API route handlers |
| `apps/antalmanac/src/planner/`                   | Planner frontend code (components, Redux store, hooks, helpers, styles) — aliased as `$planner/*` (and `$plannerApp/*` for the route tree) |
| `apps/antalmanac/src/backend/planner/`           | Planner tRPC routers ("controllers"), helpers, and auth context           |
| `packages/planner-types`                         | Shared Planner types (`@packages/planner-types`)                          |
| `packages/db/src/schema/planner/`                | Planner Postgres tables (Drizzle)                                         |

## Architecture notes

- **Two tRPC routers, one app.** The scheduler router (superjson, `/api/trpc`) and the Planner router
  (no transformer, `/planner/api/trpc`) are separate tRPC instances served by the same Next.js app.
  The Planner endpoint keeps the exact URL and wire format of the formerly separate Planner service,
  so external integrations (e.g. `external.roadmaps.getByEmail`) keep working unchanged.
- **One auth system.** Sign-in everywhere uses better-auth against the ICSSC OIDC issuer. Planner
  procedures get a `session` object bridged from the better-auth session: the Planner `user` row is
  found (or created) by email in `apps/antalmanac/src/backend/planner/context.ts`. The legacy Planner
  auth URLs (`/planner/api/users/auth/google`, `.../logout`) are thin redirects into better-auth.
  Admin access is granted to emails listed in the `ADMIN_EMAILS` env var (JSON array).
- **One database.** Planner tables were merged into the shared Postgres schema
  (migration `packages/db/migrations/0021_planner_tables.sql`) with their original table names —
  they don't collide with the scheduler's better-auth tables (`user` vs `users`, etc.).
  The Planner's `session` table (express-session) was intentionally dropped.
- **Theming.** The Planner keeps its own MUI theme, generated with the `planner` CSS variable
  prefix (`--planner-palette-*`) and driven by the `data-theme` attribute on `<html>`; the scheduler
  theme uses the default `mui` prefix with class-based color schemes, so the two never clash.
  Both share the `theme` localStorage key, so light/dark preference carries across sections.
- **Analytics.** One PostHog instance, provided by the root layout, covers both sections.

## Environment variables

In addition to the scheduler's env vars (`apps/antalmanac/src/env.ts`):

| Variable                    | Purpose                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `PUBLIC_API_URL`            | Anteater API base URL for the Planner backend (defaults to `https://anteaterapi.com/v2/rest/`) |
| `ADMIN_EMAILS`              | JSON array of emails allowed to use `/planner/admin/*`             |
| `EXTERNAL_USER_READ_SECRET` | Bearer secret for the external roadmaps API                        |

`PLANNER_CLIENT_API_KEY` is gone: the scheduler now reads roadmaps directly from the database
instead of calling the Planner over HTTP.

## Importing data from the standalone Planner database

The Planner tables keep their original names, columns, and index names, so a one-time import is a
straight dump/restore of data (schema is created by the Drizzle migration):

```sh
# 1. Apply migrations to the AntAlmanac database
pnpm db:migrate

# 2. Copy Planner data (all tables except the express-session `session` table)
pg_dump --data-only \
    -t 'user' -t account -t review -t report -t vote -t planner -t planner_year \
    -t planner_quarter -t planner_course -t planner_major -t planner_minor \
    -t custom_card -t user_major -t user_minor -t user_major_catalog_year \
    -t user_minor_catalog_year -t saved_course -t course_notes -t transferred_misc \
    -t transferred_course -t transferred_ge -t transferred_ap_exam \
    -t transferred_ap_exam_reward_selection -t completed_marker_requirement \
    -t override -t zot4plan_imports \
    "$PLANNER_DATABASE_URL" | psql "$DB_URL"
```

Planner sign-ins after the merge go through better-auth; existing Planner accounts are linked
automatically by email on first use.

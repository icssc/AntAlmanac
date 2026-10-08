# Developing AntAlmanac

The setup wizard is the way to get a working monorepo. This page is the longer version of the README: what the wizard changes, how to recover, and which commands you use afterward.

## Install mise and Docker

Install [mise](https://mise.jdx.dev/installing-mise.html) once. On Linux:

```bash
curl -fsSL https://mise.run -o /tmp/install-mise.sh
sh /tmp/install-mise.sh
export PATH="$HOME/.local/bin:$PATH"
```

macOS: `brew install mise`. On Windows, use WSL2 with Docker Desktop’s WSL integration and install mise inside WSL. You do not have to activate mise in your shell; `mise run` finds the project toolchain on its own.

Start Docker Desktop or the Docker daemon before setup. Postgres listens on port **5432**. If something else already uses that port, stop it or point `DB_URL` / `PLANNER_DATABASE_URL` at a database you manage yourself. The wizard only migrates the local Docker databases documented in `apps/antalmanac/.env.example`.

## Run setup

```bash
cd AntAlmanac
mise trust
mise install
mise run setup
```

Review `mise.toml` before trusting it. `mise install` installs Node 22 and pnpm 10.22.0, matching `.nvmrc` and `package.json`.

The welcome menu:

- **Set up my workspace** installs dependencies, writes env files, starts Postgres, migrates both databases, and fetches course data.
- **Check my environment** only reads the workspace.
- **Exit** returns to the shell.

Use ↑/↓ or j/k, then Enter. Number keys select a menu item. Ctrl+C cancels. Completed steps are safe to run again.

| Step                            | What it does                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Node & package manager          | Checks Node 22 and pnpm 10.22.0.                                                                                                              |
| Workspace dependencies          | `pnpm install --frozen-lockfile`, which also generates Anteater API types.                                                                    |
| Local environment & credentials | Fills `apps/antalmanac/.env` and `apps/antalmanac-scheduler/db/.env`. Real values are kept. Placeholder auth secrets are replaced.            |
| PostgreSQL                      | `docker compose up --wait` for the `db` service, then creates the `planner` database if this volume was created before that database existed. |
| Scheduler & planner schema      | `pnpm sched:db:migrate` and `pnpm plan:db:migrate`.                                                                                           |
| Course & term data              | `pnpm get-data` using `ANTEATER_API_KEY`.                                                                                                     |
| Development readiness           | Continues only when the required steps passed.                                                                                                |

Paste the Anteater API key when asked. Input is masked. Ctrl+U clears it. Enter with an empty key skips the fetch and lets you add the key later in `apps/antalmanac/.env`. Do not put the key in issues, chat, or command-line arguments.

Create the key at the [Anteater API dashboard](https://dashboard.anteaterapi.com/). The API itself is documented at [docs.icssc.club](https://docs.icssc.club/docs/developer/anteaterapi).

1. Open https://dashboard.anteaterapi.com/
2. If you are not signed in, sign in with your UCI Google account at https://antalmanac.com, then return to the dashboard.
3. Choose **Sign in with ICSSC**.
4. Create a secret API key.
5. Paste the key into the wizard.

A shell variable that disagrees with `.env` is reported by name. The wizard does not print the value.

## Docker

`docker-compose.yml` runs one Postgres 16 container and two databases:

| Database     | URL                                                      | Used by   |
| ------------ | -------------------------------------------------------- | --------- |
| `antalmanac` | `postgres://postgres:postgres@localhost:5432/antalmanac` | Scheduler |
| `planner`    | `postgres://postgres:postgres@localhost:5432/planner`    | Planner   |

The image is `postgres:16.8-alpine3.21`. Compose does not build that image from the database package. A health check has to pass before `docker compose up --wait` returns, so migrations are not racing server startup. Data is stored in the `antalmanac-db` volume and survives `mise run db:stop`.

`docker/postgres/init/01-planner.sql` creates `planner` the first time the volume is empty. If you already had a scheduler-only volume, the wizard creates `planner` on the next setup.

## When a step fails

1. Choose **Inspect results & recovery steps**.
2. Fix the problem in another terminal (start Docker, edit the env file, free port 5432).
3. Choose **Retry unfinished steps**.

Within one session, a successful install, migration, and course fetch are kept. Tools, env files, and Docker are checked again. Changing a database URL reruns migrations. Changing the API key reruns the fetch.

| What you see                        | What to do                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Docker is unavailable               | Start the Docker daemon and retry. The CLI alone is not enough.                                                |
| Missing API key or failed fetch     | Create a secret key at https://dashboard.anteaterapi.com/ (UCI Google at https://antalmanac.com, then Sign in with ICSSC). Save it in `apps/antalmanac/.env` and retry. |
| Port 5432 is taken                  | Stop the other service, or use a custom database and migrate it yourself.                                      |
| `apps/antalmanac/.env.local` exists | Next.js prefers that file. Move the settings into `.env` or stop using the wizard for those values.            |
| Custom database URL                 | Run `pnpm sched:db:migrate` or `pnpm plan:db:migrate` yourself. The wizard will not migrate a remote database. |
| Wrong Node or pnpm                  | `mise install`, then `mise run setup`.                                                                         |

**Finish and print summary** leaves the report in your terminal. Unresolved setup exits with code 1.

## After setup

```bash
mise run dev
```

Scheduler and Planner are both served by the `antalmanac` Next.js app.

| Command                                            | Purpose                                                                    |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `mise run doctor`                                  | Check tools, env files, generated data, and Postgres. It does not migrate. |
| `mise run db:up` / `mise run db:stop`              | Start or stop Postgres.                                                    |
| `mise run sched:db:studio`                         | Drizzle Studio for Scheduler.                                              |
| `mise run plan:db:studio`                          | Drizzle Studio for Planner.                                                |
| `mise run data`                                    | Refresh course, department, and term caches.                               |
| `pnpm sched:db:generate` / `pnpm plan:db:generate` | Generate a migration after a schema change.                                |
| `mise run test`                                    | Application tests. Generated term data has to exist.                       |
| `mise run test:setup`                              | Wizard tests. No Docker, API key, or install.                              |
| `mise run lint`                                    | Format check and lint.                                                     |

For a non-interactive terminal:

```bash
mise run setup -- --yes --plain
mise run doctor -- --plain
```

`--yes` does not invent a missing API key. `NO_COLOR=1` turns off color and animation.

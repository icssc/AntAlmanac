# Your AntAlmanac workspace

The recommended flow is **mise → setup wizard → development server**. Mise owns the Node/pnpm toolchain; the wizard prepares the app and explains anything that needs attention.

## 1. Install mise once

Use the [official installation instructions](https://mise.jdx.dev/installing-mise.html) for your platform. Common options:

```bash
# macOS with Homebrew
brew install mise

# Linux: download and run the official installer
curl -fsSL https://mise.run -o /tmp/install-mise.sh
sh /tmp/install-mise.sh
export PATH="$HOME/.local/bin:$PATH"
```

On Windows, WSL2 with Docker Desktop's WSL integration is the recommended terminal environment for this workflow. Install mise inside WSL using the Linux instructions and clone the repository there. Native Windows installation is also available through `winget install jdx.mise`; this repository's interactive flow is tested on Linux, not native Windows.

You do not need to edit your shell startup files to use project tasks. Optional [shell activation](https://mise.jdx.dev/getting-started.html) makes plain `node` and `pnpm` commands switch versions when entering the repository. Avoid having nvm/fnm and mise both automatically manage Node in the same shell.

## 2. Enter the repository and prepare the tools

```bash
cd AntAlmanac
# Review mise.toml, then trust this project's configuration.
mise trust
mise install
mise run setup
```

`mise install` supplies Node 22 and pnpm 10.22.0, matching `.nvmrc` and `package.json`. The wizard's tests detect version drift between these files. Commands run from a repository subdirectory still use the project root. `mise run setup` preserves terminal input/output so the TUI remains interactive.

Start Docker Desktop or your Linux Docker daemon before setup. The database listens on port 5432. If another database uses that port, stop that conflicting service or configure and manage a custom database manually.

## 3. Follow the wizard

The welcome screen offers:

- **Set up my workspace** — install dependencies, prepare environment files, start the database, apply migrations, and generate course data.
- **Check my environment** — inspect the current setup before choosing whether to run setup.
- **Exit** — return to the terminal.

Use **↑/↓** or **j/k** and **Enter**. You can also select a menu option by number. The screen adapts to terminal size and shows progress, the active command, elapsed step time, and recent output. A terminal around 100 columns by 30 rows gives the checklist and menus plenty of room.

The setup sequence is:

| Step                            | What happens                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Node & package manager          | Verify the versions mise provided.                                                                  |
| Workspace dependencies          | Install from the frozen pnpm lockfile and generate Anteater API types. Internet access is required. |
| Local environment & credentials | Prepare `apps/antalmanac/.env` and `packages/db/.env`; generate a local auth secret.                |
| PostgreSQL container            | Start Docker Compose and wait for PostgreSQL to accept connections.                                 |
| Database schema                 | Apply migrations to the documented local development database.                                      |
| Course & term data              | Fetch department, term, search, and section-code caches. A working API key is required.             |
| Development readiness           | Check that all required setup steps succeeded.                                                      |

When prompted, paste your **Anteater API key**. Input is masked; **Ctrl+U** clears it. Press Enter with no key to finish the other available work and return later. Ask a project lead if you need access. Do not paste credentials into issues, chat transcripts, or command-line arguments.

Existing real credentials are preserved. To replace an invalid saved key, edit `ANTEATER_API_KEY` in `apps/antalmanac/.env`, then retry. You may also supply a key through your shell for the initial setup; if shell values conflict with `.env`, the wizard identifies the variable without displaying its value.

Maps, analytics, and Planner integration credentials are optional locally. Google sign-in depends on the configured ICSSC OIDC service. AANTS and the iOS wrapper have separate workflows; this wizard prepares the Scheduler web app.

## 4. Recover without starting over

When a step fails, the result screen stays open:

1. Choose **Inspect results & recovery steps**. Use arrows, `j`/`k`, or Page Up/Page Down to read the report. Enter or Escape returns to the menu.
2. Fix the issue in another terminal or start the missing service.
3. Choose **Retry unfinished steps**.

Within the same session, successful dependency installs, migrations, and data fetches are retained. Tools, environment files, and database availability are checked again. Changing the database URL invalidates the completed migration step; changing the API key invalidates the completed data-fetch step. After restarting the wizard, setup runs its normal sequence again; existing credentials are still preserved and migrations are safe to reapply.

| Message or symptom                                | Next action                                                                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Docker unavailable                                | Start Docker Desktop or the Docker daemon, then retry. Installing Docker's CLI alone is insufficient.                                        |
| Missing API key or failed fetch                   | Set a valid `ANTEATER_API_KEY` in `apps/antalmanac/.env`, check network access, and retry.                                                   |
| Port 5432 already allocated                       | Resolve the conflicting local service, then retry.                                                                                           |
| Next.js `.env.local` overrides `.env`             | Review and consolidate local settings before retrying; the wizard does not overwrite those files.                                            |
| Custom database URL                               | Manage migrations manually with `mise exec -- pnpm db:migrate`. The wizard only automatically migrates the documented local Docker database. |
| Wrong Node or pnpm                                | Run `mise install`, then launch via `mise run setup`.                                                                                        |
| `mise` command not found after Linux installation | Add `$HOME/.local/bin` to PATH, or invoke `$HOME/.local/bin/mise` directly.                                                                  |
| Missing `termData.json` or `searchData.json`      | Finish the data step. Starting Next.js alone does not generate these files.                                                                  |

**Finish and print summary** leaves the results in your terminal. Unresolved setup exits with code 1. **Ctrl+C** cancels setup and restores the terminal; completed work remains. Database containers started by setup remain available until explicitly stopped.

## 5. Start building

When all setup steps pass, choose **Start the development server**. The wizard restores the terminal and hands it to Next.js. Open the URL Next.js prints, normally http://localhost:3000; it may choose a different port if 3000 is occupied. Ctrl+C stops the server.

For later sessions:

```bash
mise run db:up
mise run dev
```

Useful project tasks:

| Command               | Purpose                                                                             |
| --------------------- | ----------------------------------------------------------------------------------- |
| `mise run`            | Open mise's searchable task picker.                                                 |
| `mise run doctor`     | Inspect app configuration, dependencies, generated data, and database availability. |
| `mise run db:studio`  | Browse your configured database through Drizzle Studio.                             |
| `mise run db:stop`    | Stop PostgreSQL, preserving its container and data.                                 |
| `mise run data`       | Refresh course and term caches using the configured API key.                        |
| `mise run test`       | Run application tests; generated term data must already exist.                      |
| `mise run test:setup` | Test the setup wizard without Docker, API credentials, or app dependencies.         |
| `mise run lint`       | Run repository lint checks.                                                         |

The doctor does not apply or verify the full migration history and does not authenticate an API key. Run setup for those operations. Mise itself may install a missing tool before any task runs, including the doctor. Application secrets remain in their existing `.env` files rather than being loaded into every mise task.

For automation or terminals without interactive input:

```bash
mise run setup -- --yes --plain
mise run doctor -- --plain
```

`--yes` suppresses prompts; it does not supply missing credentials or turn failures into success. `NO_COLOR=1` also disables color and animation. Direct entry points remain available: `node scripts/setup.mjs`, `pnpm run setup`, and `pnpm setup:check` with the correct Node version.

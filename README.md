![AntAlmanac](apps/antalmanac/public/banner.png)

AntAlmanac is UC Irvine’s course-planning platform: **Scheduler** for quarterly schedules and **Planner** for multi-year roadmaps. Both run from this repository as one Next.js app at [antalmanac.com](https://antalmanac.com).

| Scheduler                                             | Planner                                             |
| ----------------------------------------------------- | --------------------------------------------------- |
| Search classes and preview them on a calendar         | Track majors, minors, and GE requirements           |
| Jump to prerequisites, grades, and enrollment history | Import an unofficial transcript and transfer credit |
| See class locations on a map                          | Build a multi-year roadmap                          |

## Start here

You need [mise](https://mise.jdx.dev/installing-mise.html), a running Docker engine, and an Anteater API key (ask a project lead). From the repository root:

```bash
mise trust
mise install
mise run setup
```

`mise install` provides Node 22 and pnpm 10.22.0. The setup wizard then:

1. Installs workspace dependencies
2. Writes `apps/antalmanac/.env` and `apps/antalmanac-scheduler/db/.env`, keeping credentials you already have
3. Starts PostgreSQL and waits until it is healthy
4. Migrates the scheduler database (`antalmanac`) and the planner database (`planner`)
5. Fetches course and term data

When every step passes, start the app from the wizard or with `mise run dev`. Next.js prints the URL, usually http://localhost:3000.

```bash
mise run            # searchable task list
mise run doctor     # read-only check; does not migrate or fetch
mise run db:up      # start Postgres
mise run db:stop    # stop Postgres, keep the data
mise run data       # refresh course data
mise run test:setup # wizard tests; no Docker or API key
```

Already on Node 22? `pnpm setup` is pnpm’s own command. Use `pnpm run setup` or `node scripts/setup.mjs`.

The full walkthrough — screens, credentials, recovery, and daily commands — is in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Repository

```
apps/
  antalmanac/             Next.js app (routes and public assets for both products)
  antalmanac-scheduler/   Scheduler site, Drizzle database, and shared types
  antalmanac-planner/     Planner site, API, and types
  aants/                  Enrollment notification service
  ios/                    iOS wrapper
packages/
  anteater-api/           Anteater API client and types
```

Local configuration lives in `apps/antalmanac/.env.example`. The wizard fills local database URLs and auth secrets. Maps, analytics, admin emails, and `PLANNER_CLIENT_API_KEY` can stay unset while you work locally.

## Contributing

1. Find or open an issue, comment that you want it, and wait to be assigned.
2. Branch from the repository (or your fork).
3. Run `mise run setup`.
4. Open a draft pull request and keep pushing until the issue is done.
5. Mark it ready for review. A maintainer merges it.

Read [ICSSC’s contributor guidelines](https://docs.icssc.club/docs/contributor/common/guidelines) before you start. Questions go to the [Projects Discord](https://discord.gg/Zu8KZHERtJ).

## Technology

Next.js and React, with MUI. Scheduler state uses Zustand; Planner state uses Redux. The API layer is tRPC, backed by the [Anteater API](https://docs.icssc.club/docs/about/anteaterapi), Drizzle, and PostgreSQL. AWS deploys are defined with SST. Tests run on Vitest.

## History

AntAlmanac started in 2018 with @the-rango. PeterPortal, now Planner, started on the same ICSSC Projects Committee with @uci-mars. In February 2026 the two products became one platform. The archived PeterPortal client is at [icssc/peterportal-client](https://github.com/icssc/peterportal-client). More of the story is in the [merge announcement](https://docs.icssc.club/docs/about/antalmanac/merge).

| Year         | Scheduler lead               | Planner lead |
| ------------ | ---------------------------- | ------------ |
| 2018–2019    | @the-rango (founder)         |              |
| 2019–2020    | @devsdevsdevs                |              |
| 2020–2021    | @devsdevsdevs                | @uci-mars    |
| 2021–2022    | @ChaseC99                    | @chenaaron3  |
| 2022–2023    | @EricPedley                  | @ethanwong16 |
| 2023–2024    | @EricPedley, @ap0nia         | @js0mmer     |
| 2024–2025    | @MinhxNguyen7, @adcockdalton | @Awesome-E   |
| 2025–2026    | @alexespejo                  | @CadenLee2   |
| 2026–present | @sicn4rf                     | @anthonyj33  |

## Deployment

Maintainers deploy with SST. Production is `antalmanac.com`. Pull requests get `staging-{number}.antalmanac.com`. `staging-shared.antalmanac.com` is the long-lived Scheduler/Planner integration environment. Production secrets live in AWS and CI, not in the setup wizard.

## Data and disclaimer

Course data comes from UCI Catalogue, UCI Public Records, and WebReg via the Anteater API. AntAlmanac is not an official UCI service. Please don’t flood it with requests or try to break it.

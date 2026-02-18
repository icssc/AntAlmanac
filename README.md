![AntAlmanac](apps/antalmanac/public/banner.png)

# About

AntAlmanac is a schedule planner website for classes at UC Irvine. These are some of its features:

-   **_Search bar_** to easily find classes by department (e.g COMPSCI), section code (e.g. 36040), and keywords (e.g. artificial intelligence).
-   **_Integrated calendar_** to preview class times.
-   **_Quick links_** to professor reviews, prerequisites, grade distributions, and past enrollment data.
-   **_Interactive map_** with markers for your class locations.

![project screenshot](https://github.com/user-attachments/assets/e1f8d3ce-8188-41ab-817a-850e51e6bd1a)

## Technology

Our website is a Next.js application deployed on AWS using SST (Serverless Stack).
A summary of the libraries we use are listed below.

### Frontend

-   [Next.js](https://nextjs.org) - React framework with server-side rendering.
-   [MUI](https://mui.com) - React UI library.
-   [React Big Calendar](https://github.com/jquense/react-big-calendar) - React calendar component.
-   [Recharts](https://recharts.org/en-US) - React chart component.
-   [Leaflet](https://leafletjs.com) - Interactive JS maps.
-   [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) - State management.

### Backend

-   [tRPC](https://trpc.io) - type-safe API access layer for the AntAlmanac API.
-   [Anteater API](https://docs.icssc.club/docs/about/anteaterapi) - API maintained by ICSSC for retrieving UCI data.
-   [Drizzle ORM](https://orm.drizzle.team/) - [high-performance](https://orm.drizzle.team/benchmarks) type-safe SQL-like access layer compatible with all major SQL dialects.
-   [PostgreSQL](https://www.postgresql.org) - Relational database for storing user data and schedules.

### Tooling

-   [SST](https://sst.dev) - Infrastructure as code framework for AWS deployment.
-   [Docker](https://www.docker.com) - Containerization for local database development.
-   [Vitest](https://vitest.dev) - Test runner.
-   [TypeScript](https://www.typescriptlang.org) - JavaScript with type-checking.

## History

AntAlmanac was created in 2018 by a small group of students under the leadership of @the-rango.  
They formed an AntAlmanac club to recruit other students and work on new features,
so that the website would live on even after its makers graduated.

In 2019, @devsdevsdevs took over as AntAlmanac Project Lead and oversaw a massive rewrite of the codebase,
laying the foundation for the AntAlmanac that we know and love today.

In 2020, AntAlmanac was adopted by the ICSSC Projects Committee, which continues to provide funding, marketing, and engineering
to support the growing number of users and open-source developers that make up our AntAlmanac Community.

Since then, the project has continued to evolve and grow with successive generations of projects committee members!

| Year           | Project Lead         |
| -------------- | -------------------- |
| 2018 - 2019    | @the-rango (founder) |
| 2019 - 2021    | @devsdevsdevs        |
| 2021 - 2022    | @ChaseC99            |
| 2022 - 2024    | @EricPedley          |
| 2023 - 2024    | @ap0nia              |
| 2024 - 2025    | @MinhxNguyen7        |
| 2024 - 2025    | @adcockdalton        |
| 2025 - Present | @alexespejo          |

# Contributing

We welcome open-source contributions 🤗.
Here is a rough guide on how to contribute:

## Steps

1. Look through the
   [issue tracker](https://github.com/icssc/AntAlmanac/issues) or
   [Kanban board](https://github.com/icssc/AntAlmanac/wiki/Kanban-Board-Docs)
   to find an open issue (one that hasn't been assigned to anybody)
   or create your own that describes the problem you want to fix.
2. [Fork the repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo) or
   create a branch if you have the permission to do so.
3. [Setup your development environment](#get-setup-to-develop-locally)
4. Create a draft pull request with your new branch to track your progress.
5. Make any desired changes, commit, and push them. Repeat until the selected issue has been addressed.
6. Change the pull request from draft to open. If possible, request a review from a maintainer.
7. Wait for your pull request to get reviewed and address any requested changes.
   Repeat until your pull request is approved.
8. Merge your pull request and your changes will appear on the live website shortly! 🥳

## Additional Help

If you ever need help, feel free to ask around on our [Discord server](https://discord.gg/Zu8KZHERtJ).

# Development Environment

## Pre-requisites

1. Install `Node.js` (version 22 or higher). This allows you to run JavaScript on your computer (outside of a browser).
   This is best done with a version manager that allows you to easily switch between
   Node.js versions based on the requirements of different projects.
   Try using any of the following.

    - [nvm](https://github.com/nvm-sh/nvm) - Node-Version-Manager.
    - [fnm](https://github.com/Schniz/fnm) - Fast-Node-Manager.
    - [nvm-windows](https://github.com/coreybutler/nvm-windows)

    If none of those work for any reason, you can defer to your Operating System's
    package manager or [the downloads from the official website](https://nodejs.org/en/download).

2. Install `pnpm` (version 10 or higher). This is our package manager of choice for this project.
   It's responsible for installing, uninstalling, and keeping track of the app's dependencies.

    ```bash
    npm install --global pnpm
    ```

3. Install `Docker`. This is required to run the local PostgreSQL database.
    - [Docker Desktop](https://www.docker.com/products/docker-desktop) - Available for macOS, Windows, and Linux.

## Developing

### Quick Start


1. Copy this and run the script:
    ```bash
    git clone https://github.com/icssc/AntAlmanac && cd AntAlmanac && git checkout dsns/create-dev-environment && ./start.sh
    ```

2. View the local website at http://localhost:3000.
   As you make changes to the application, those changes will be automatically reflected on the local website with hot reloading.

3. In the future, start the development server using
    ```bash
    pnpm dev
    ```


### Additional Commands

-   **Database Studio**: Open Drizzle Studio to view and manage your local database.

    ```bash
    pnpm db:studio
    ```

-   **Generate Database Migrations**: After modifying the database schema, generate a new migration.

    ```bash
    pnpm db:generate
    ```

-   **Run Tests**: Execute the test suite.
    ```bash
    pnpm test
    ```

### Notes

-   For more detailed information, see the [frontend README](/apps/antalmanac/README.md).

## Testing

From the root directory, run `pnpm test`. Or from any directory, run `pnpm -w test`.

## Deployment

AntAlmanac is deployed to AWS using [SST (Serverless Stack)](https://sst.dev). The deployment process is automated and managed through the `sst.config.ts` file.

### Deployment Environments

-   **Production**: Deployed to `sst.antalmanac.com`
-   **Staging**: Deployed to `staging-{PR_NUMBER}.antalmanac.com` for pull request previews

### Deploying to Production

> **Note**: Only maintainers with proper AWS credentials can deploy to production.

To deploy the production environment:

```bash
pnpm deploy
```

This command runs `sst deploy --stage production` which:

1. Builds the Next.js application
2. Deploys the infrastructure to AWS (Lambda, CloudFront, etc.)
3. Updates the live website at sst.antalmanac.com

### Environment Variables

The following environment variables are required for deployment and should be configured in your AWS environment or CI/CD pipeline:

-   `DB_URL` - Database connection string 
-   `MAPBOX_ACCESS_TOKEN` - Mapbox API token for map features
-   `NEXT_PUBLIC_TILES_ENDPOINT` - Endpoint for map tiles
-   `ANTEATER_API_KEY` - API key for Anteater API
-   `OIDC_CLIENT_ID` - OAuth client ID for Google authentication
-   `OIDC_ISSUER_URL` - OAuth issuer URL
-   `GOOGLE_REDIRECT_URI` - OAuth redirect URI (automatically set based on stage)

# Troubleshooting

## `npm i -g <package>` fails

This is usually an issue with permissions because `npm` is trying to install a Node package
into a globally accessible location like `/bin`, which needs admin permissions to do so.

The best way to resolve this is to install Node via any version manager to properly handle
these sorts of permissions. Here are the different version managers again.

-   [nvm](https://github.com/nvm-sh/nvm) - Node-Version-Manager.
-   [fnm](https://github.com/Schniz/fnm) - Fast-Node-Manager.
-   [nvm-windows](https://github.com/coreybutler/nvm-windows)

A more convenient, but less secure way to resolve this is to run the command with admin privileges, e.g with `sudo`.

## The website doesn't seem to load at all

Try disabling your adblocker or browser extensions that might interfere with local development.

## I need environment variables!

Please reference the `.env.example` files provided.

If you need production credentials to access the production database or other private resources, please contact a project lead.

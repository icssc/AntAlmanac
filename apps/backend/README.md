# AntAlmanac Backend

This is the dedicated backend for [AntAlmanac](https://antalmanac.com),
which is primarily responsible for managing user data and internal information.

This is **_NOT_** for retrieving enrollment data from UCI;
[Anteater API](https://docs.icssc.club/docs/developer/anteaterapi) is a separate ICSSC project dedicated
to providing us this information.

# Setup

## Environment Variables
- Environment variables can be provided manually through the shell or using a `.env` file.
    - The latter is recommended for convenience.
    - The key-value pairs in the `.env` file, if it exists, will be automatically loaded into the environment.
- For this, rename make a copy of the `.env.example` file and rename it to `.env`.
- Populate the keys following the instructions below.
    - Note that the Mapbox API key can be left blank, which will cause the app to default to OSM's tiles.

## AnteaterAPI Key
- The key is required to send course information requests to AnteaterAPI.
- It can be acquired from the [AnteaterAPI Dashboard](https://dashboard.anteaterapi.com).

## Local Database
- Install PostgreSQL and pgAdmin.
    - [Instructions](https://medium.com/@jewelski/quickly-set-up-a-local-postgres-database-using-docker-5098052a4726) for setup with Docker.
    - The instructions on PostgreSQL' website for direct-on-OS installation works as well.
- Use pgAdmin to connect to the PostgreSQL server.
- Create the database.
    - Right-click on the server in the left bar, hover over "Create", and click "Database..."
    - Name it antalmanac-dev.
- Add the connection string to the `.env` file.
    - It's in the format `postgres://USERNAME:PASSWORD@HOST:PORT/antalmanac-dev`
- Migrate the database.
    - This adds the relations (but not the data) to the currently-empty database.
    - `cd` into this directory (`apps/backend` from the repository root).
    - Run `pnpm migrate`. This creates the migration SQL file and runs it on the database specified in the environment variables.

# Development

## Database
- The database is accessed and manipulated using [Drizzle ORM](https://orm.drizzle.team/).
- The schema is defined in `src/db/schema`.

### Applying Changes
- Changes to the database will only be applied when `pnpm migrate` is run.
    - This runs `drizzle-kit generate` and `drizzle-kit migrate`.
    - The former creates an SQL file (migration) that representing the difference/change to the existing database schema. 
    - The latter connects to the database and runs the migrations that have not been applied.
- The new migrations must be committed for them to be applied to production when the PR is merged.

### Viewing
- The database's content can be viewed by running `pnpm studio`.
    - This runs [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview), a web application where tables and their data can be viewed and changed.

## tRPC Routing
- tRPC allows endpoints and their types to be defined as they are implemented.
- The router is defined in `src/routers/index.ts` and is used in `src/index.ts` as a route of the Express server.
- The router's type is imported in the frontend (`[repository root]/apps/antalmanac/src/lib/api/trpc.ts`) to create the client.
    - The type-safe client ensures that requests from the front-end are correctly typed.

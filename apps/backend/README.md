# AntAlmanac Backend

This is the dedicated backend for [AntAlmanac](https://antalmanac.com),
which is primarily responsible for managing user data and internal information.

This is **_NOT_** for retrieving enrollment data from UCI;
[Anteater API](https://docs.icssc.club/developer/anteaterapi) is a separate ICSSC project dedicated
to providing us this information.

# Development

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
    - `cd` into `apps/backend`.
    - Run `pnpm migrate`. This creates the migration SQL file and runs it on the database specified in the environment variables.

# Architecture

## tRPC Routing (TODO)

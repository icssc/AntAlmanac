# AntAlmanac Backend

This is the dedicated backend for [AntAlmanac](https://antalmanac.com),
which is primarily responsible for managing user data and internal information.

This is **_NOT_** for retrieving enrollment data from UCI;
[Anteater API](https://docs.icssc.club/developer/anteaterapi) is a separate ICSSC project dedicated
to providing us this information.

# Development

## Non-Privileged

When developing as a non-privileged member,
the environment variables won't reflect real credentials to resources such as the database.

The backend should still work, but with limited functionality.
Please request credentials from a project lead if you need them.

1. Ensure that you're in the backend project. i.e. `cd apps/backend` from the project root.
2. Rename `.env.sample` to `.env` and follow any necessary instructions in there.
3. Start the server with `pnpm start`.

## Privileged

ICSSC Project Committee Members can be given `.env` files with real credentials upon request.
These can be used to access real resources such as DynamoDB, MapBox, etc.

Remove any `.env.*` files in the project root, and insert the `.env` you were given.

# Architecture

## tRPC Routing (TODO)

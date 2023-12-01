# AntAlmanac Backend

This is the dedicated backend for [AntAlmanac](https://antalmanac.com),
which is primarily responsible for managing user data and internal information.

This is ___NOT___ for retrieving enrollment data from UCI; 
[PeterPortal API](https://api.peterportal.org) is a separate ICSSC project dedicated
to providing us this information.


# Development 

## Non-Privileged
When developing as a non-privileged member,
the environment variables won't reflect real credentials to resources such as the database.

The backend should still work, but with limited functionality.
Please request credentials from a project lead if you need them.

1. Ensure that you're in the backend project. i.e. `cd apps/backend` from the project root.
1. Change the `.env.sample` to `.env`.
2. Start the server with `pnpm start`.

## Privileged
ICSSC Project Committee Members can be given `.env` files with real credentials upon request.
These can be used to access real resources such as DynamoDB, MapBox, etc.

Remove any `.env.*` files in the project root, and insert the `.env` you were given.


# Architecture

## tRPC Routing (TODO)
We're currently migrating to [tRPC](https://trpc.io) and thus deprecating the
previous REST based architecture.
The desired functionality of the backend is still documented below.

## REST Routing (Deprecating)
The backend provides the following functionality.

- `/banners`  
Returns the ads displayed above course search results.

- `/news`  
Returns a list of news announcements displayed on the top right navbar.

- `/notifications`  
Used to register for class notifications.

- `/users`  
Saves and returns user schedules.

- `/enrollmentData` 
Returns information about course enrollment from previous terms.
(Legacy - this information is provided by PeterPortal API)

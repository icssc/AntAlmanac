# AntAlmanac Backend
This is the backend repository for [AntAlmanac](https://antalmanac.com).

## Routes
The backend serves the following routes
- `/banners`  
Returns the ads displayed above course search results.
- `/news`  
Returns a list of news announcements displayed on the top right navbar.
- `/notifications`  
Used to register for class notifications.
- `/users`  
Saves and returns user schedules.

### Deprecated Routes
Since AntAlmanac now uses the [PeterPortal API](https://api.peterportal.org) for course information, these routes are unnecessary. However we keep them around incase the API goes down.
- `/enrollmentData`  
Returns information about course enrollment from previous terms.

## Running Locally
_Only ICSSC Project Committee Members will the credentials necessary to connect to the databases._
1. Add the `.env` file  
2. Obtain AWS credentials
3. Run the backend: `pnpm start`  
_Only do this if you just want to run the backend by itself. To run the whole project with the frontend and backend, you shoudl run `pnpm start:all` inside of the main [AntAlmanac repository](https://github.com/icssc-projects/AntAlmanac)._

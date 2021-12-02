# AntAlmanac Backend
This is the backend repository for [AntAlmanac](https://antalmanac.com).
It is a submodule within the main [AntAlmanac repository](https://github.com/icssc-projects/AntAlmanac). You shouldn't need to manually clone or run this repository, unless you want to work on it without the frontend.

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

### Depreciated Routes
Since AntAlmanac now uses the [PeterPortal API](https://api.peterportal.org) for course information, these routes are unnecessary. However we keep them around incase the API goes down.
- `/enrollmentData`  
Returns information about course enrollment from previous terms.
- `/websocapi`  
Fetch information from the WebSoC website.

## Running Locally
1. Add the `.env` file  
_Only ICSSC Project Committee Members will have access to the `.env` file necessary to run the backend locally._

2. Install Serverless on your machine  
`npm install -g serverless`

3. Run the backend using Serverless  
`sls offline --stage development --noPrependStageInUrl`  
_Only do this if you just want to run the backend by itself. To run the whole project with the frontend and backend, you just need to run `npm start` inside of the main [AntAlmanac repository](https://github.com/icssc-projects/AntAlmanac)._

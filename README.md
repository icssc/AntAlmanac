# AntAlmanac
![AntAlmanac Logo](/public/logo.png)

## Get Setup to Develop Locally
1. Clone the AntAlmanc repository  

2. Navigate to the root directory and install the dependencies  
`cd AntAlmanac`  
`npm install`  

3. Start the development server  
`npm start`

4. The site should load on http://localhost:3000  
As you make changes to the React application in `src`, those changes will be automatically reflected on the site.

### Running the Backend
The backend server **isn't necessary for frontend development**. By default, your frontend will send requests to `dev.api.antalmanac.com`, which has it's own database that is seperate from production's.

If you need run the backend, you must do the following:
- Update the `endpointTransform` function in [api/endpoints.js](https://github.com/icssc/AntAlmanac/blob/main/src/api/endpoints.js#L2) to `return path;`. This will point it at the backend on `localhost:8080`
- Clone the backend repository  
`git clone git@github.com:icssc/antalmanac-backend.git`
- Follow the setup instructions in [antalmanac-backend/README.md](https://github.com/icssc/antalmanac-backend#readme)

## Deploying
We use GitHub Pages to deploy our site. Only ICSSC Project Committee members with push access will be able to deploy the website.

Make sure you are on the latest version of `main` before running the deploy command.
```bash
git checkout main
git pull
npm run deploy
```
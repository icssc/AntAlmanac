![AntAlmanac](/public/banner.png)
## About
AntAlmanac is a schedule planner website for classes at UC Irvine. Here are some of its features:
- Search bar to easily find classes by department (e.g COMPSCI), course code (e.g. ICS 31), and keywords (e.g. artificial intelligence)
- Calendar view to make it easier to see class times and spot conflicts
- Quick links to professor reviews, prerequisites, grade distributions, and past enrollment data.
- Notification system to tell you when a class goes from full to waitlist
- See where your classrooms are with the map view
- Clean UI (see below)
![project screenshot](https://user-images.githubusercontent.com/48658337/177026240-be0f79b4-e909-486b-aa52-c1a435983781.png)
### Tech Stack
Our site is a React single page application bootstrapped with create-react-app and hosted on Github Pages. We use the Material UI component library for most of our styling. The site gets its course data from the [PeterPortal API](https://api.peterportal.org/), which is also maintained by ICSSC.
### History
This project started as a side project by two UCI students in 2018 and soon was transferred to the ICS Student Council Projects Committee. Since then, the project has continued to evolve and grow with successive generations of projects committee members. Right now the most tenured members of the AntAlmanac team started in 2021.
## Contributing
We welcome open-source contributions 🤗 Here is a rough guide on how to contribute:
1. Look through the [issue tracker](https://github.com/icssc/AntAlmanac/issues) to find an open issue (nobody else is assigned) or create your own that describes the problem you want to fix
2. Fork the repository. If you're on the ICSSC Projects Committee and we've given you write access, create a branch instead of forking.
3. [Get Setup to Develop Locally](#get-setup-to-develop-locally)
4. Make your changes and push them. Then create a pull request from your branch or fork to `main`.
6. Wait for your request to get reviewed and respond to any changes until you get approval.
7. Your PR gets merged and you see your changes live on the site 🥳

### Get Setup to Develop Locally
1. Clone the AntAlmanc repository or your fork

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
# AntAlmanac

## Get Setup to Develop Locally
1. Clone the AntAlmanc repository and its submodules  
`git clone --recursive https://github.com/icssc-projects/AntAlmanac.git`

2. Navigate to the root directory and install the dependencies  
`cd AntAlmanac`  
`npm install`  

3. Start the development server  
`npm start`

4. The site should load on http://localhost:3000  
As you make changes to the React application in `client/src`, those changes will be automatically reflected on the site.

### Running the Backend
The backend server **isn't necessary for frontend development**.

However if you do want to run the backend, you must do the following:
- Make sure the antalamanac-backened submodule exists.  
_You should already have this if you ran `git clone --recursive`. Otherwise you can install it with `git submodule update --init --recursive`._
- Add the `.env` file.  
_Only ICSSC Project Committee Members will have access to the `.env` file necessary to run the backend locally._

![AntAlmanac](apps/antalmanac/public/banner.png)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ficssc%2FAntAlmanac.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Ficssc%2FAntAlmanac?ref=badge_shield)

## About

AntAlmanac is a schedule planner website for classes at UC Irvine. Here are some of its features:

-   Search bar to easily find classes by department (e.g COMPSCI), course code (e.g. ICS 31), and keywords (e.g. artificial intelligence)
-   Calendar view to make it easier to see class times and spot conflicts
-   Quick links to professor reviews, prerequisites, grade distributions, and past enrollment data.
-   Notification system to tell you when a class goes from full to waitlist
-   See where your classrooms are with the map view
-   Clean UI (see below)
    ![project screenshot](https://user-images.githubusercontent.com/48658337/177026240-be0f79b4-e909-486b-aa52-c1a435983781.png)

### Tech Stack

Our site is a React single page application bootstrapped with create-react-app and hosted on Github Pages.
We use the Material UI component library for most of our styling.
The site gets its course data from the [PeterPortal API](https://api.peterportal.org/),
which is also maintained by ICS Student Council (ICSSC).

### History

AntAlmanac was created in 2018 by a small group of students under the leadership of @the-rango.  
They formed an AntAlmanac club to recruit other students and work on new features,
so that the website would live on even after its makers graduated.  
In 2019, @devsdevsdevs took over as AntAlmanac Project Lead and oversaw a massive rewrite of the codebase,
laying the foundation for the AntAlmanac that we know and love today.  
In 2020, AntAlmanac was adopted by the ICSSC Projects Committee.  
ICSSC continues to provide funding, marketing, and engineering 
to support the growing number of users and open-source developers that make up our AntAlmanac Community.
Since then, the project has continued to evolve and grow with successive generations of projects committee members!

| Year        | Project Lead         |
| ----------- | -------------------- |
| 2018 - 2019 | @the-rango (founder) |
| 2019 - 2021 | @devsdevsdevs        |
| 2021 - 2022 | @ChaseC99            |
| 2022 -      | @EricPedley          |

## Contributing

We welcome open-source contributions 🤗 Here is a rough guide on how to contribute:

1. Look through the [issue tracker](https://github.com/icssc/AntAlmanac/issues) or [Kanban board](https://github.com/icssc/AntAlmanac/wiki/Kanban-Board-Docs) to find an open issue (nobody else is assigned) or create your own that describes the problem you want to fix. 
2. Fork the repository. If you're on the ICSSC Projects Committee and we've given you write access, create a branch instead of forking.
3. [Get setup to develop locally](#get-setup-to-develop-locally)
4. Create a draft pull request so others can track your progress.
5. Make your changes and push them as you complete them. Change the PR from draft to open once you're done.
6. Wait for your request to get reviewed and respond to any changes until you get approval.
7. Your PR gets merged and you see your changes live on the site 🥳

We have a 30 minute contributor video tutorial available on YouTube (https://www.youtube.com/watch?v=_v91cqGzu5o).

If you ever need help, feel free to ask around on our [Discord server](https://discord.gg/Zu8KZHERtJ).

### Get Setup to Develop Locally

1. Clone the AntAlmanac repository or your fork.

2. Navigate to the root directory and install the dependencies.
   `npm i -g pnpm` 
   `cd AntAlmanac`  
   `pnpm install`

3. Start the development server(s).
   - Frontend only
      `pnpm start:aa`
   - Frontend and Backend
      `pnpm start`

4. The website should be viewable at http://localhost:5173, 
   and the backend server at http://localhost:8080 (if started).
   As you make changes to the React application in `src`, those changes will be automatically reflected on the website locally.

#### Running Tests
1. Run `pnpm test` in the root directory

### Running the [Backend](https://github.com/icssc/antalmanac-backend)

The backend server __isn't necessary for frontend development__. 
By default, your frontend will send requests to `dev.api.antalmanac.com`, which has it's own database that is separate from production's.

If you want to run the backend locally, use `pnpm start:all` from the root of the repository.

[More in-depth instructions for working with the server can be found in its README](apps/backend/README.md)

## Manual Deployment

(For ICSSC Projects Committee members with write access to the repository only)

We use GitHub Pages to deploy our site.
Usually deployments are done automatically through GitHub Actions,
but if we need to deploy manually the instructions are below.

Make sure you are on the latest version of `main` before running the deploy command.

```bash
git checkout main
git pull
pnpm run deploy
```

## Troubleshooting

### `npm i -g <package>` fails
This is usually an issue with permissions because `npm` is trying to install a Node package 
into a globally accessible location like `/bin`, which needs admin permissions to do so.

The best way to resolve this is to install Node via any version manager to properly handle 
these sorts of permissions.
- [fnm](https://github.com/Schniz/fnm)
- [nvm](https://github.com/nvm-sh/nvm)

The easier way to resolve this is to run the command with admin privileges.

### The React website doesn't seem to load at all
- Try disabling your adblocker.


### I need the env variables for the backend!
An example `.env.sample` is provided and can be used by renaming it to `.env`
If you need real credentials to access the database or private resources,
please contact a project lead.


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Ficssc%2FAntAlmanac.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Ficssc%2FAntAlmanac?ref=badge_large)
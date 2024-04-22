![AntAlmanac](apps/antalmanac/public/banner.png)

# About

AntAlmanac is a schedule planner website for classes at UC Irvine. These are some of its features:

- ___Search bar___ to easily find classes by department (e.g COMPSCI), course code (e.g. ICS 31), and keywords (e.g. artificial intelligence).
- ___Integrated calendar___ to preview class times.
- ___Quick links___ to professor reviews, prerequisites, grade distributions, and past enrollment data.
- ___Interactive map___ with markers for your class locations.

![project screenshot](https://user-images.githubusercontent.com/48658337/177026240-be0f79b4-e909-486b-aa52-c1a435983781.png)

## Technology
Our website is a single page React application hosted on Github Pages.
A summary of the libraries we use are listed below.

### Frontend
- [MUI](https://mui.com) - React UI library.
- [React Big Calendar](https://github.com/jquense/react-big-calendar) - React calendar component.
- [Recharts](https://recharts.org/en-US) - React chart component.
- [Leaflet](https://leafletjs.com) - Interactive JS maps.
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) - State management.

### Backend
- [tRPC](https://trpc.io) - type-safe API access layer for the AntAlmanac API.
- [PeterPortal API](https://api.peterportal.org) - API maintained by ICSSC for retrieving UCI data.

### Tooling
- [Vite](https://vitejs.dev) - Blazingly fast, modern bundler.
- [Vitest](https://vitest.dev) - Test runner.
- [AWS](https://aws.amazon.com) - Website deployment and hosting.
- [TypeScript](https://www.typescriptlang.org) - JavaScript with type-checking.

## History

AntAlmanac was created in 2018 by a small group of students under the leadership of @the-rango.  
They formed an AntAlmanac club to recruit other students and work on new features,
so that the website would live on even after its makers graduated.  

In 2019, @devsdevsdevs took over as AntAlmanac Project Lead and oversaw a massive rewrite of the codebase,
laying the foundation for the AntAlmanac that we know and love today.  

In 2020, AntAlmanac was adopted by the ICSSC Projects Committee, which continues to provide funding, marketing, and engineering 
to support the growing number of users and open-source developers that make up our AntAlmanac Community.

Since then, the project has continued to evolve and grow with successive generations of projects committee members!

| Year           | Project Lead         |
| ---------------| -------------------- |
| 2018 - 2019    | @the-rango (founder) |
| 2019 - 2021    | @devsdevsdevs        |
| 2021 - 2022    | @ChaseC99            |
| 2022 - 2024    | @EricPedley          |
| 2023 - Present | @ap0nia              |
| 2024 - Present | @MinhxNguyen7        |


# Contributing

We welcome open-source contributions 🤗.
Here is a rough guide on how to contribute:

## Steps
1. Look through the 
  [issue tracker](https://github.com/icssc/AntAlmanac/issues) or 
  [Kanban board](https://github.com/icssc/AntAlmanac/wiki/Kanban-Board-Docs) 
  to find an open issue (one that hasn't been assigned to anybody)
  or create your own that describes the problem you want to fix. 
2. [Fork the repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo) or
   create a branch if you have the permission to do so.
3. [Setup your development environment](#get-setup-to-develop-locally)
4. Create a draft pull request with your new branch to track your progress.
5. Make any desired changes, commit, and push them. Repeat until the selected issue has been addressed.
6. Change the pull request from draft to open. If possible, request a review from a maintainer.
7. Wait for your pull request to get reviewed and address any requested changes.
   Repeat until your pull request is approved.
8. Merge your pull request and your changes will appear on the live website shortly! 🥳

## Video Walkhrough
We also have a 30 minute contributor [video tutorial](https://www.youtube.com/watch?v=_v91cqGzu5o) available on YouTube.

## Additional Help
If you ever need help, feel free to ask around on our [Discord server](https://discord.gg/Zu8KZHERtJ).


# Development Environment

## Pre-requisites
1. Install `Node.js`. This allows you to run JavaScript on your computer (outside of a browser).
   This is best done with a version manager that allows you to easily switch between
   Node.js versions based on the requirements of different projects.
   Try using any of the following.
   - [nvm](https://github.com/nvm-sh/nvm) - Node-Version-Manager.
   - [fnm](https://github.com/Schniz/fnm) - Fast-Node-Manager.
   - [nvm-widows](https://github.com/coreybutler/nvm-windows)

   If none of those work for any reason, you can defer to your Operating System's
   package manager or [the downloads from the official website](https://nodejs.org/en/download).
   We will be using the latest LTS version, 20.10.0, lts/iron.

2. Install `pnpm`. This is our package manager of choice for this project.
   It's responsible for installing, uninstalling, and keeping track of the app's dependencies.
   `npm install --global pnpm`

## Developing
1. Clone the AntAlmanac repository or your fork.
   `git clone https://github.com/icssc/AntAlmanac.git`

2. Navigate to the root directory and install the dependencies.
   `cd AntAlmanac && pnpm install`

3. Start the development server for the frontend.
  `pnpm start:aa` or `cd apps/antalmanac && pnpm dev`

4. View the local website at http://localhost:5173.
   As you make changes to the React application, those changes will be automatically reflected on the local website.


For more information on developing the frontend and backend projects locally, 
see their respective READMEs.

- [frontend](/apps/antalmanac/README.md)
- [backend](/apps/backend/README.md)

Typically, you won't need to start the backend server locally 
because an active development server is available for usage. 

However, if you would like to start both the frontend and the backend locally,
you can run `pnpm start` from the project root.

## Testing
From the root directory, run `pnpm test`. Or from any directory, run `pnpm -w test`.


# Troubleshooting

## `npm i -g <package>` fails
This is usually an issue with permissions because `npm` is trying to install a Node package 
into a globally accessible location like `/bin`, which needs admin permissions to do so.

The best way to resolve this is to install Node via any version manager to properly handle 
these sorts of permissions. Here are the different version managers again.
- [nvm](https://github.com/nvm-sh/nvm) - Node-Version-Manager.
- [fnm](https://github.com/Schniz/fnm) - Fast-Node-Manager.
- [nvm-widows](https://github.com/coreybutler/nvm-windows)

A more convenient, but less secure way to resolve this is to run the command with admin privileges, e.g with `sudo`.

## The React website doesn't seem to load at all
Try disabling your adblocker.

## I need the env variables for the backend!
An example `.env.sample` is provided and can be used by renaming it to `.env`
If you need real credentials to access the database or private resources,
please contact a project lead.

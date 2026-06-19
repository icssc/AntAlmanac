![AntAlmanac Logo](site/src/asset/logo.svg)

# About

AntAlmanac Planner is a web application designed to aid UCI students with course discovery and planning. We consolidate public data available on multiple UCI sources via [Anteater API](https://docs.icssc.club/docs/about/anteaterapi) to improve the user experience when planning course schedules. Features include:

- **A drag-and-drop multi-year course planner**:
  - Select multiple majors and minors
  - Import your unofficial transcript via [StudentAccess](https://www.reg.uci.edu/access/student/transcript/?seg=U) to automatically fill in your roadmap to date
  - View how your planned roadmap fulfills your **major**, **specialization**, **minor**, and **GE** requirements
  - Import any **transferred courses**, **AP exams**, and **GE/Elective credits**

![Roadmap](assets/roadmap.png)

- **Course Search**:
  - Recent offerings 
  - Grade distribution visualizations
  - Visual prerequisite tree
  - Historic Schedule of Classes data
  - Reviews from UCI students

![Course Search](assets/coursesearch.png)

- **Instructor Search**:
  - Grade distribution visualizations
  - Historic Schedule of Classes data
  - Reviews from UCI students
  
![Instructor Search](assets/instructorsearch.png)

## Technology

### Frontend
- [React](https://react.dev/) - Library to build dynamic, component-based UIs.
- [Next.js](https://nextjs.org/) - React framework with server-side rendering.
- [Material UI](https://mui.com/material-ui/) - React component library that implements Google's Material Design. 

### Backend
- [Anteater API](https://github.com/icssc/anteater-api) - API maintained by ICSSC for retrieving UCI data.
- [Express](https://expressjs.com/) - Minimalist backend framework for Node.js.
- [tRPC](https://trpc.io/) - Library for type-safe APIs.
- [PostgreSQL](https://www.postgresql.org/) - Relational database for storing user data and planners.
- [Drizzle ORM](https://orm.drizzle.team/) - High-performance type-safe SQL-like access layer.

### Tooling
- [SST](https://sst.dev/) - Infrastructure as code framework for AWS deployment.
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with type-checking.

## History
AntAlmanac Planner was originally created in 2020 under the name **PeterPortal** by a team of ICSSC Projects Committee members led by @uci-mars, aiming to unify fragmented course information and long-term planning resources in one application.

In February 2026, PeterPortal [merged](https://docs.icssc.club/docs/about/antalmanac/merge) with [AntAlmanac](https://github.com/icssc/AntAlmanac/) into one ultimate course planning platform. Following the merger, PeterPortal was rebranded as **AntAlmanac Planner**, while the original AntAlmanac became **AntAlmanac Scheduler**.

Year|Project Lead
:-:|:-:
2020 - 2021|@uci-mars
2021 - 2022|@chenaaron3
2022 - 2023|@ethanwong16
2023 - 2024|@js0mmer
2024 - 2025|@Awesome-E
2025 - Present|@CadenLee2

# Contributing
We welcome all open-source contributions! Here is a rough guide on how to contribute:

## First Time Setup

### Prerequisites

1. Check your Node version with `node -v`. Make sure you have version 18, 20, or 22 LTS. If you don't, we recommend [nvm](https://github.com/nvm-sh/nvm) to manage node versions (or [nvm-windows](https://github.com/coreybutler/nvm-windows)).

2. We use pnpm as our package manager. If you don't have pnpm, install it with `npm i -g pnpm`

### Committee Members

1. Clone the repository to your local machine:

   ```
   git clone https://github.com/icssc/peterportal-client
   ```

2. `cd` into the cloned repo.

3. Run `pnpm install` to install all node dependencies for the site and API. This may take a few minutes.

4. Set up the appropriate environment variables provided by the project lead.

5. Switch to a branch you will be working on for your current task (pick a name that's relevant to the issue).
   ```
   git checkout -b [branch name]
   ```

### Open Source Contributors

1. Fork the project by clicking the fork button in the top right, above the about section.

2. Clone your forked repository to your local machine

```
git clone https://github.com/<your username>/peterportal-client
```

3. `cd` into the cloned repo.

4. Run `pnpm install` to install all node dependencies for the site and API. This may take a few minutes.

5. Make a copy of the `.env.example` file in the api directory and name it `.env`. This includes the minimum environment variables needed for running the backend.

6. (Optional) Set up your own PostgreSQL database and Google OAuth to be able to test features that require signing in such as leaving reviews or saving roadmaps to your account. Add additional variables/secrets to the .env file from the previous step.

**Have any questions or need some help? Feel free to join the [ICSSC Projects Discord](https://discord.gg/GzF76D7UhY) and ask around in the `#peterportal` channel!**
  
> ⚠️ Note: Anteater API requires a special API key in order for search functionality to work. If you'd like to work on a feature relating to this, please send a message in our Discord.

## Open Source Contribution Guide

1. Choose an issue you would like to work on under the issues tab. Leave a comment requesting to work on this issue and wait for confirmation that it is not already assigned.

2. Switch to a branch you will be working on for each issue (pick a name that's relevant).

```
git checkout -b [branch name]
```

3. Once your feature is ready, [open a pull request](https://github.com/icssc/peterportal-client/compare) and a member from our team will review it. Follow the pull request template.

## Running the Project Locally (After Setup)

1. Open a terminal in the root directory of the repo.

2. Run `pnpm run dev` to start both the backend Express server and frontend Next.js dev server

3. Visit the link printed to the console by Next.js!

Optionally, you can run the site/api separately by changing into their respective directories in two different terminal windows and running `pnpm run dev`

# Where Does the Data Come From?

We consolidate our data directly from official UCI sources such as: UCI Catalogue, UCI Public Records Office, and UCI WebReg (courtesy of [Anteater API](https://github.com/icssc/anteater-api)).

# Disclaimer

Although we consolidate our data directly from official UCI sources, this application is by no means an official UCI tool. We strive to keep our data as accurate as possible with the limited support we receive from UCI. Please take this into consideration while using the website.

# Terms & Conditions

There are no hard policies at the moment for utilizing this tool. However, please refrain from abusing the website by methods such as: sending excessive amount of requests in a small period of time or purposely looking to exploit the system.

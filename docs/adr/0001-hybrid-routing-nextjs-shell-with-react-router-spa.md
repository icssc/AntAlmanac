# Hybrid routing: Next.js shell with React Router SPA

The main AntAlmanac UI is a client-only React Router DOM v6 SPA, loaded inside a Next.js App Router shell via a dynamic import with `ssr: false`. Next.js handles the outer layout, metadata/SEO, API routes (tRPC, Mapbox proxy), and static generation of a handful of paths for crawlers. All interactive navigation happens client-side through React Router.

This was chosen because the application is a highly interactive schedule planner where most state is client-side (calendars, drag-and-drop, undo/redo). Server-side rendering the main UI would add complexity without user-facing benefit — the meaningful content requires JavaScript to interact with. Next.js was adopted for its API route colocations (tRPC adapter), PWA support (`next-pwa`), and deployment story (OpenNext + SST), not for SSR of the planner UI.

The trade-off is that two routing systems coexist: contributors must understand which routes are Next.js pages (SEO shells, API routes) and which are React Router paths (everything in `src/routes/`). New pages that need SEO or static generation go in `app/`; new interactive views go in `routes/`.

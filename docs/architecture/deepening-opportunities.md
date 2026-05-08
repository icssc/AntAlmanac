# Deepening Opportunities

Architectural friction in the AntAlmanac codebase, presented as deepening candidates. Each candidate identifies shallow modules, leaked seams, or missing locality — and proposes how to concentrate complexity behind a smaller interface.

Vocabulary follows [CONTEXT.md](/CONTEXT.md) for domain terms and the architecture language from the skill (module, interface, seam, adapter, depth, leverage, locality).

---

## 1. Collapse `AppStore` ↔ `ActionTypesStore` ↔ `AppStoreActions` into a single deep Schedule module

**Files**

- `apps/antalmanac/src/stores/AppStore.ts`
- `apps/antalmanac/src/stores/Schedules.ts`
- `apps/antalmanac/src/actions/AppStoreActions.ts`
- `apps/antalmanac/src/actions/ActionTypesStore.ts`
- `apps/antalmanac/src/stores/localTempSaveDataHelpers.ts`

**Problem**

Understanding how a Course is added to a Schedule requires bouncing across five files with circular imports:

1. Component calls `addCourse` from `AppStoreActions` (analytics, term warning, shape the ScheduleCourse).
2. That calls `AppStore.addCourse` (EventEmitter singleton).
3. `AppStore.addCourse` calls `actionTypesStore.autoSaveSchedule` — back into the actions layer.
4. `ActionTypesStore.autoSaveSchedule` reads `SessionStore`, decides whether to call `autoSaveSchedule` from `AppStoreActions` — a circular reference.
5. `AppStoreActions.autoSaveSchedule` calls `trpc.userData.saveUserData` and updates `AppStore.schedule`.

The interface across this cluster is enormous: callers must know which of ~20 pass-through exports in `AppStoreActions` to use, when to call `AppStore` directly, and what side effects each path triggers. Many `AppStoreActions` exports are one-line delegates (`deleteCourse`, `deleteCustomEvent`, `editCustomEvent`, `clearSchedules`, `addCustomEvent`). These fail the deletion test — deleting them would simply move the call to the only call site, concentrating nothing.

Meanwhile `Schedules` (the actual state) is deep but hidden behind the shallow `AppStore` EventEmitter wrapper, which adds `unsavedChanges`, `skeletonMode`, event emissions, and autosave wiring — all interface taxes on every mutation.

**Solution**

Merge into a single **Schedule module** (Zustand store with methods). The interface would be:

- Mutations: `addCourse`, `removeCourse`, `addCustomEvent`, `removeCustomEvent`, `reorderSchedules`, `undo`, `redo`.
- Persistence: `save()`, `load(userId)`, `loadGuest(username)`.
- Derived state: `calendarEvents`, `finalsEvents`, `scheduleNames`, `unsavedChanges`.

Autosave, analytics, and snackbar feedback become **internal implementation** — triggered inside mutation methods, not cross-wired via separate modules. The tRPC call is an internal seam (adapter: real tRPC in production, in-memory stub in tests).

**Benefits**

- **Locality**: all Schedule mutation logic, persistence, undo/redo, and autosave live in one file. A bug in "add course then autosave" is investigated in one place.
- **Leverage**: components get `useScheduleStore().addCourse(section, details, term, index)` — one call, all side effects handled internally.
- **Tests**: test the Schedule module's interface directly (add course → assert calendar events change, assert `unsavedChanges` becomes true). No need to mock `actionTypesStore` or `AppStore` event emissions separately.

---

## 2. Replace the `RDS` static class with domain-scoped repository modules

**Files**

- `apps/antalmanac/src/backend/lib/rds.ts` (~780 lines)
- `apps/antalmanac/src/backend/routers/userData.ts`
- `apps/antalmanac/src/backend/routers/notifications.ts`
- `apps/antalmanac/src/backend/routers/review.ts`
- `apps/antalmanac/src/backend/context.ts`

**Problem**

`RDS` is a static class with 25+ methods spanning four unrelated domains: auth (accounts, sessions), schedule persistence (schedules, courses, custom events), notifications (subscriptions), and user lookup. Every method takes `db` as its first argument — the class provides no encapsulation of the connection. Its interface is as wide as the sum of its methods; callers must scan the full class to find what they need.

Meanwhile, the `review` router bypasses `RDS` entirely and queries Drizzle inline — proof that the abstraction isn't earning its keep as a universal data access layer. New features avoid it because the class is too large to navigate and extend.

The `// biome-ignore lint/complexity/noStaticOnlyClass: todo` comment at the top acknowledges the problem.

**Solution**

Split into domain-scoped repository modules, each with a focused interface:

- **`auth.repository.ts`** — `getAccountByProvider`, `registerUserAccount`, `upsertSession`, `removeSession`, `getCurrentSession`.
- **`schedule.repository.ts`** — `getUserSchedules`, `saveSchedules` (the transactional upsert), `getGuestSchedule`.
- **`subscription.repository.ts`** — `getSubscriptions`, `upsertSubscription`, `deleteSubscription`, `updateAllSubscriptions`.
- **`user.repository.ts`** — `getUserById`, `getUserByEmail`, `getGoogleIdByUserId`.

Each repository takes `db` at construction (or from context), not per-call. The `review` router already demonstrates this inline pattern — formalize it.

**Benefits**

- **Locality**: a bug in "save schedule" means looking at `schedule.repository.ts` + `userData` router, not grepping a 780-line class.
- **Leverage**: each repository's interface is small (3–6 methods) and domain-aligned. Routers import only what they need.
- **Tests**: repositories are individually testable against PGLite (local-substitutable dependency). The `RDS` class is currently untested because its interface is too wide to set up fixtures for.

---

## 3. Unify the client data-fetching layer behind tRPC + React Query

**Files**

- `apps/antalmanac/src/lib/api/trpc.ts` (vanilla proxy client)
- `apps/antalmanac/src/providers/Query.tsx` (bare QueryClient, unused by tRPC)
- `apps/antalmanac/src/lib/websoc.ts`
- `apps/antalmanac/src/lib/grades.ts`
- `apps/antalmanac/src/lib/enrollmentHistory.ts`
- `apps/antalmanac/src/lib/notifications.ts`
- `apps/antalmanac/src/stores/NotificationStore.ts`
- `apps/antalmanac/src/stores/DepartmentsStore.ts`

**Problem**

The client has two data-fetching stacks that don't compose:

1. **Vanilla tRPC proxy** (`createTRPCProxyClient`) — called imperatively from stores, actions, hooks, and components. No caching, no deduplication, no automatic revalidation.
2. **React Query** (`QueryClientProvider`) — mounted in the provider tree but **never wired to tRPC**. It exists for potential future use but provides no value today.

This means every store that fetches data re-implements its own loading/error/cache pattern. `NotificationStore` has `isLoading` + `loadNotifications()` + local map. `DepartmentsStore` has `loadDepartments()` + fallback. `SessionStore` has `loadSession()` + flags. `Schedules.fromScheduleSaveState` calls `WebSOC.getCourseInfo` and manages its own batching. There is no shared interface for "fetch remote data, cache it, revalidate when stale."

**Solution**

Adopt `@trpc/react-query` (or the newer `@trpc/tanstack-react-query`) to unify tRPC and React Query behind a single seam. The interface becomes:

- `trpc.websoc.getSchedule.useQuery({ term, codes })` — cached, deduplicated, auto-revalidated.
- `trpc.userData.getUserData.useQuery()` — single source of truth for session/schedule data.
- `trpc.notifications.get.useQuery()` — replaces `NotificationStore.loadNotifications`.

Stores like `NotificationStore` and `DepartmentsStore` become unnecessary — their only depth was managing fetch lifecycle, which React Query handles generically. The Zustand stores that remain are those with genuine client-only state (calendar selection, UI toggles, undo/redo).

**Benefits**

- **Leverage**: one interface (`useQuery` / `useMutation`) replaces N bespoke fetch-and-cache patterns across stores.
- **Locality**: cache invalidation logic lives in mutation callbacks (`onSuccess: () => utils.notifications.get.invalidate()`), not scattered across imperative store methods.
- **Tests**: React Query's test utilities (`createTRPCMockClient`) let you test components without real network calls and without mocking store internals.

---

## 4. Extract a `userData` router into separate Auth and Schedule Persistence modules

**Files**

- `apps/antalmanac/src/backend/routers/userData.ts` (~292 lines)

**Problem**

The `userData` router conflates three distinct concerns behind a single namespace:

1. **OAuth flow** — `getGoogleAuthUrl`, `handleGoogleCallback` (PKCE state, cookie management, token exchange, ID token decoding, account registration).
2. **Session management** — `getUserAndAccount`, `logout`, `getCurrentUser`.
3. **Schedule persistence** — `getUserData`, `saveUserData`, `getGuestScheduleByUsername`, `flagImportedSchedule`.

These have different auth requirements (OAuth endpoints are public; persistence requires a session), different dependencies (OAuth needs Arctic + cookies; persistence needs `RDS` schedule methods), and different rates of change (OAuth is stable; schedule persistence evolves with the Schedule Save State schema).

A developer working on "add schedule notes to save state" must navigate OAuth procedure definitions. A developer debugging "Google login fails" must read past schedule serialization logic. The interface doesn't match the domain.

**Solution**

Split into:

- **`auth` router** — OAuth flow + session management. Interface: `getAuthUrl(redirectUri)`, `handleCallback(code, state)`, `logout()`, `getSession()`.
- **`schedule` router** — persistence. Interface: `get()`, `save(state)`, `getGuest(username)`, `flagImported()`.

Each router imports only the repository it needs (auth.repository or schedule.repository from candidate #2).

**Benefits**

- **Locality**: OAuth bugs are investigated in one 80-line router, not a 292-line file.
- **Leverage**: the `schedule` router's interface is purely about Schedule Save State — no OAuth concepts leak in.
- **Tests**: OAuth flow tested with a mock OAuth adapter (true-external dependency). Schedule persistence tested against PGLite. Currently impossible to test either in isolation because they share a file and import graph.

---

## 5. Deepen the Subscription module across the `antalmanac` ↔ `aants` boundary

**Files**

- `apps/antalmanac/src/backend/routers/notifications.ts`
- `apps/antalmanac/src/backend/lib/rds.ts` (subscription methods)
- `apps/aants/src/helpers/subscriptionData.ts`
- `apps/aants/src/index.ts`
- `packages/db/src/schema/subscription.ts`

**Problem**

Subscription logic is split across two apps with no shared module:

- **AntAlmanac** creates/reads/deletes subscriptions via `RDS.upsertNotification`, `RDS.retrieveNotifications`, etc.
- **AANTS** reads the same `subscriptions` table via its own Drizzle queries in `subscriptionData.ts`, checks status, filters users, and updates rows.

Both apps import `@packages/db` and write raw Drizzle queries against `subscriptions`. The schema is the only shared interface, but it doesn't encode business rules like "a subscription is scoped to an environment" or "lastUpdatedStatus transitions trigger notifications." These invariants are duplicated in both apps.

Additionally, public `deleteNotification` and `deleteAllNotifications` endpoints in the main app accept raw `userId` in the request body — a different trust model from session-based endpoints, documented only by a code comment.

**Solution**

Create a **`packages/subscriptions`** module (or extend `packages/db`) with a deep interface:

- `subscribe(userId, sectionCode, term, preferences, environment)` — handles upsert + validation.
- `unsubscribe(userId, sectionCode, term, environment)` — single delete.
- `unsubscribeAll(userId, environment)` — bulk delete.
- `getActiveSubscriptions(environment)` — what AANTS needs to poll.
- `recordStatusChange(sectionCode, term, newStatus, environment)` — encapsulates the comparison + update that AANTS currently does inline.

The "environment scoping" invariant is enforced inside the module, not by callers remembering to pass `getStage()`. The trust model for unsubscribe links becomes an explicit adapter (token-verified unsubscribe vs session-verified unsubscribe).

**Benefits**

- **Locality**: subscription business rules live in one package, tested once. Both apps import the same module.
- **Leverage**: AANTS's `scanAndNotify` shrinks to: get subscriptions → poll WebSOC → call `recordStatusChange` → dispatch emails. No raw Drizzle in the worker.
- **Tests**: the subscription module is testable with PGLite (local-substitutable). Currently neither app tests subscription logic because the queries are scattered across files.

---

## 6. Remove pass-through `lib/` wrappers and let routers own their external API calls

**Files**

- `apps/antalmanac/src/backend/lib/helpers.ts` (`fetchAnteaterAPI`)
- `apps/antalmanac/src/backend/routers/course.ts`
- `apps/antalmanac/src/backend/routers/grades.ts`
- `apps/antalmanac/src/backend/routers/enrollHist.ts`
- `apps/antalmanac/src/backend/routers/websoc.ts`

**Problem**

`fetchAnteaterAPI` is a shallow helper: it adds an `Authorization` header and optionally wraps errors as `TRPCError`. Its interface (URL string + options object) is nearly as complex as calling `fetch` directly. Routers like `course` are themselves shallow — they validate input, call `fetchAnteaterAPI`, and return `data.data`. Two layers of shallowness stacked.

These routers fail the deletion test: if you deleted `course.ts`, the one component calling `trpc.course.get` would just call `fetchAnteaterAPI` directly (or `fetch`). The router adds type safety at the tRPC boundary, which has value, but the `fetchAnteaterAPI` helper beneath it does not.

**Solution**

Inline `fetchAnteaterAPI`'s logic (Authorization header + error handling) into a thin `anteaterApi` utility that returns typed results. Keep the routers — they provide the tRPC type boundary — but delete the pretense that `fetchAnteaterAPI` is a meaningful seam. One adapter, not two.

Alternatively, if the routers are truly 1:1 proxies, consider whether the client should call Anteater API directly (with the key injected server-side via a proxy route) and eliminate the tRPC hop entirely for read-only public data.

**Benefits**

- **Clarity**: removes a layer that exists only because "helpers should be in lib/", not because it hides complexity.
- **Locality**: the full Anteater API call (URL construction, auth, error handling, response shaping) is visible in one place per route.
- **Deletion test**: `fetchAnteaterAPI` currently passes the deletion test negatively — deleting it would spread its (minimal) logic to 4 callers. But those 4 callers already construct the URL and handle the typed response themselves; the helper's contribution is just `headers: { Authorization }`.

---

## 7. Consolidate `SessionStore` by extracting Planner state

**Files**

- `apps/antalmanac/src/stores/SessionStore.ts`
- `apps/antalmanac/src/hooks/usePlanner.ts`

**Problem**

`SessionStore` mixes two unrelated concerns:

1. **Auth session state**: `userId`, `googleId`, `name`, `loadSession()`, `clearSession()`.
2. **Planner data**: `roadmaps`, `roadmapsLoading`, `takenCourses`, `setRoadmaps()`, `setTakenCourses()`.

The planner fields are populated by `usePlanner` hook (which also reads `RightPaneStore`). They ended up in `SessionStore` because roadmaps require a `googleId` — but that's a data dependency, not a domain relationship. A Roadmap is not part of a Session.

This coupling means any component subscribing to session changes (e.g. to show a login button) re-renders when roadmap data loads. It also means testing session logic requires setting up planner mocks.

**Solution**

Extract a **`PlannerStore`** (Zustand) that owns `roadmaps`, `roadmapsLoading`, `takenCourses`. It reads `googleId` from `SessionStore` as a dependency — the data flows one way. `usePlanner` populates `PlannerStore` instead of reaching into `SessionStore`.

**Benefits**

- **Locality**: planner bugs are investigated in `PlannerStore` + `usePlanner`, not in a 150-line session file.
- **Leverage**: `SessionStore`'s interface becomes purely about auth (5 fields, 2 methods). Components subscribing to session state don't re-render on planner changes.
- **Tests**: session logic tested without planner mocks; planner logic tested by providing a fake `googleId`.

---

## What's next

These candidates are ordered roughly by impact (1 = highest friction, broadest benefit). They are independent — any can be pursued without the others, though #1 and #3 compose well (the unified Schedule module would use React Query internally), and #2 and #4 compose well (repository split enables router split).

**Which of these would you like to explore?**

# Syllabi Integration Plan

Tracking issue: [icssc/AntAlmanac#1634](https://github.com/icssc/AntAlmanac/issues/1634)
Upstream API PR: [icssc/anteater-api#366](https://github.com/icssc/anteater-api/pull/366)

This document proposes how to wire the new `anteater-api` `GET /v2/rest/websoc/syllabi` endpoint into AntAlmanac's course search results. It assumes the endpoint lands as described in PR #366 and does not change shape before release.

## 1. Endpoint summary

```
GET /v2/rest/websoc/syllabi?courseId=COMPSCI161[&year=2025][&quarter=Fall][&instructor=SHINDLER,+M.]
```

Response (abbreviated, per `apps/api/src/schema/websoc.ts`):

```ts
type Syllabus = {
    year: string;               // "2025"
    quarter: "Fall" | "Winter" | "Spring" | "Summer1" | "Summer10wk" | "Summer2";
    instructorNames: string[];  // ["SHINDLER, M.", ...] — aggregated per (year, quarter, url)
    url: string;                // Canvas syllabus link
};
// Sorted most-recent first (year desc, then term order desc) by the API.
```

Key properties we rely on:

1. Grouping key is `(year, quarter, url)`, not `(year, quarter, instructor)`. When two professors co-teach a section that shares a `webURL`, their names are aggregated into `instructorNames`. When two professors teach **different** sections of the same course in the same quarter, each section's URL becomes its own row, each with its own instructor list.
2. The endpoint is already course-scoped; it requires `courseId`.
3. Filters (`year`, `quarter`, `instructor`) are optional; we should pull the unfiltered list and do the UX (grouping / highlighting) client-side so one request covers all the views below.
4. Missing data is an empty array — "no syllabi yet" is a valid response.

## 2. Product requirements

Derived from the task and issue #1634:

- A **blue button in search results** labeled `Syllabi` that mirrors the existing `Past Enrollment` button.
- The **Syllabus column** in the section table should also surface the historical data, not just the raw `webURL` for the displayed section.
- Handle four cases gracefully:
    1. **Course exists, no syllabi anywhere yet** → show an empty-state message; button still present.
    2. **Current-quarter syllabus exists** → prominent link plus historical list.
    3. **Only past syllabi exist** → list chronologically, newest first.
    4. **Multiple professors teach the same course in the same term** → each offering listed distinctly (API gives us separate rows per URL), grouped under the quarter.
- **Professors teaching the current quarter should be elevated** (sorted first or otherwise indicated) across both the course-level popover and the syllabus cell dropdown. "Current quarter" = the term selected in the search form (`RightPaneStore.formData.term`).
- Use MUI (v7, already in use) and match the existing `color="primary"` blue token.

## 3. Data flow

Pattern mirrors `enrollHist` ([`apps/antalmanac/src/backend/routers/enrollHist.ts`](../apps/antalmanac/src/backend/routers/enrollHist.ts)):

1. **Server tRPC procedure** (`apps/antalmanac/src/backend/routers/syllabi.ts`)
    - Input: `z.object({ courseId: z.string() })`.
    - Calls `fetchAnteaterAPI<SyllabiAPIResult>(`https://anteaterapi.com/v2/rest/websoc/syllabi?${params}`)`.
    - Returns `result.data` unchanged (preserves API sort order).
    - Register on the root router in `apps/antalmanac/src/backend/routers/index.ts` as `syllabi`.
2. **Shared type** (`packages/types/src/websoc.ts` or a new `syllabi.ts`)
    - Re-export `Syllabus` / `SyllabiAPIResult` from `@packages/anteater-api-types` (after the spec regenerates post-merge of PR #366). Until then, define a local interface with the shape above and replace it when the generated types land.
3. **Client helper** (`apps/antalmanac/src/lib/syllabi.ts`)
    - Exposes `getSyllabi(courseId: string): Promise<Syllabus[]>` that calls `trpc.syllabi.get.query({ courseId })`.
    - Houses pure helpers: `groupByTerm`, `sortWithCurrentFirst`, `isCurrentOffering(syllabus, currentTerm)`.
4. **Consumers**
    - `SyllabiPopup` (course-level, opened by the blue button).
    - `SyllabusCell` (per-section, in the Syllabus column).

Both consumers share the same fetched list by keying on `courseId`. We can add a tiny in-module cache (`Map<courseId, Promise<Syllabus[]>>`) so opening the popover and interacting with the cell don't double-fetch. A React Query migration is not required for this feature — `AppQueryProvider` already exists (`src/providers/Query.tsx`) but is underused, so we stay consistent with the existing `trpc + useEffect` pattern in `EnrollmentHistoryPopup`.

## 4. UI: the blue `Syllabi` button

Place in `SectionTable.tsx` right after the `Past Enrollment` button (around line 135) using the existing `CourseInfoButton` abstraction so we get the same blue `variant="contained" color="primary"` styling, analytics wiring, and popover container for free.

```tsx
<CourseInfoButton
    analyticsCategory={analyticsCategory}
    analyticsAction={analyticsEnum.classSearch.actions.CLICK_SYLLABI}
    text="Syllabi"
    icon={<MenuBook />}
    popupContent={
        <SyllabiPopup
            deptCode={courseDetails.deptCode}
            courseNumber={courseDetails.courseNumber}
            term={term}
        />
    }
/>
```

- Add `CLICK_SYLLABI` to `analyticsEnum.classSearch.actions`.
- Icon: `MenuBook` from `@mui/icons-material` (reads as "syllabus"); alternative is `Description`.

### `SyllabiPopup` content

Layout (top to bottom):

1. **Header** — `"<DEPT> <NUMBER> · Syllabi"` using the same typography as `EnrollmentHistoryPopup`'s header.
2. **Current-quarter band** — rendered only if any syllabus matches the selected `term`. Uses `Alert severity="info"` (or a `Paper` with subtle `primary.light` background) and a `List` of the matching offerings with instructor names and an outbound `Button size="small" endIcon={<OpenInNew />}` linking to the URL.
3. **Group toggle** — `ToggleButtonGroup` with two options: `By Quarter` (default) and `By Professor`. Persists in component state only (no global store needed).
4. **Grouped list** — `List` with `ListSubheader` per group.
    - By Quarter: headers like `Fall 2025`, descending. Items show `instructorNames.join(", ")` + a link button.
    - By Professor: headers are instructor names. Items show `Fall 2025` + link. When "elevate current" is on (default), professors teaching the selected `term` appear first, visually tagged with a `<Chip size="small" color="primary" label="Teaching this quarter" />`.
5. **Empty state** — `"No syllabi available yet for this course."` inside a centered `Typography variant="body2"`, matches tone of `EnrollmentHistoryPopup`'s `popupTitle` fallback.
6. **Loading state** — `Skeleton` rows, same pattern as the enrollment popup.

Width: `isMobile ? 280 : 420` — narrower than the enrollment chart because content is textual. Max height with `overflowY: auto` so long histories scroll.

### Case handling, concretely

| Case | Behavior |
|---|---|
| No syllabi at all | Empty state only; button still visible so users know the feature exists. |
| Current-quarter syllabus exists | Current-quarter band shown above the grouped list; that row is also deduped/omitted from the group below to avoid repetition, or left in but visually unchanged — we will omit from the group for clarity. |
| Only past syllabi | No current-quarter band; grouped list is the whole view. |
| Multiple profs same term, same URL | API returns one row with multiple `instructorNames`; render as a single item listing all names. |
| Multiple profs same term, different URLs | API returns multiple rows; render as sibling list items under the same quarter header. |
| Professor teaches current quarter and previously | In "By Professor" view, their header is elevated + chip. In "By Quarter" view, the current-quarter band already surfaces them. |

## 5. UI: the Syllabus column

Today `SyllabusCell` just wraps the section's `webURL` in a `react-router-dom` `Link`. We change it so:

- If the current section already has a `webURL`, primary action is still a direct link to it (preserves one-click access during the quarter the students are planning).
- A secondary affordance opens the same historical list scoped to that section's instructors.

Proposed cell structure (MUI):

```tsx
<TableBodyCellContainer>
    {webURL ? (
        <Link to={webURL} target="_blank" rel="noreferrer">Link</Link>
    ) : null}
    <IconButton size="small" onClick={handleOpen} aria-label="Past syllabi">
        <History fontSize="inherit" />
    </IconButton>
    <Popover ...>
        <SyllabiPopup
            deptCode={deptCode}
            courseNumber={courseNumber}
            term={term}
            highlightInstructors={section.instructors}
        />
    </Popover>
</TableBodyCellContainer>
```

- When `webURL` is present: text link + icon button side by side.
- When `webURL` is missing (case 1): icon button only — solves the "column is empty during planning" motivation from the API PR description.
- `highlightInstructors` tells `SyllabiPopup` to also elevate rows whose `instructorNames` intersect this section's instructors, in addition to current-quarter elevation. This is the natural "syllabi for this professor, for this class" drill-down.

While here, fix the latent bug in `SyllabusCellProps`: the prop is typed `WebsocSectionStatus` but is actually a URL string. Update to `string | null | undefined`.

## 6. Current-quarter detection

"Current quarter" in this feature = **the term the user is currently searching in**, not today's calendar term. Rationale:

- The section table already receives `term` as a prop from `CourseRenderPane`, which sources it from `RightPaneStore.formData.term` (`YYYY <Quarter>` short name). Using it keeps the UI internally consistent: when the user searches "2026 Winter", "Teaching this quarter" means 2026 Winter.
- Fallback when `term` is unavailable (e.g. a future caller): `getCurrentTerm()` in `lib/termData.ts`.

Helper (in `lib/syllabi.ts`):

```ts
export function parseTerm(shortName: string): { year: string; quarter: Term } { /* ... */ }

export function isCurrentOffering(s: Syllabus, current: { year: string; quarter: Term }) {
    return s.year === current.year && s.quarter === current.quarter;
}

export function elevateForCurrent(
    syllabi: Syllabus[],
    current: { year: string; quarter: Term },
    extraInstructors: string[] = [],
) { /* stable sort: current-term first, then instructor-match, then API order */ }
```

## 7. Grouping logic

Two views, both pure functions over the `Syllabus[]` list:

- `groupByTerm(syllabi)` → `Map<"Fall 2025", Syllabus[]>`, iteration order preserved by API sort (year desc, term desc).
- `groupByProfessor(syllabi)` → `Map<instructorName, Syllabus[]>`. A syllabus with N instructors contributes to N groups (a professor's list should show every offering they were on). Within each professor group, sort by term desc.

Professor-view elevation rule: stable-sort groups so that any professor in the current term appears before the rest. Visual cue: a `Chip` on the group header.

## 8. Accessibility & polish

- The blue button gets `aria-haspopup="dialog"` via `CourseInfoButton` (already the case) and a descriptive `aria-label="View syllabi for <DEPT> <NUMBER>"`.
- External-link list items use `target="_blank" rel="noopener noreferrer"` and an `OpenInNew` icon for affordance.
- Keyboard: focus moves into the popover on open (MUI default) and `Esc` dismisses.
- Respect `isMobile` for sizing, like `EnrollmentHistoryPopup`.

## 9. Files touched

New files:

- `apps/antalmanac/src/backend/routers/syllabi.ts`
- `apps/antalmanac/src/lib/syllabi.ts`
- `apps/antalmanac/src/components/RightPane/SectionTable/SyllabiPopup.tsx`

Edited files:

- `apps/antalmanac/src/backend/routers/index.ts` — register `syllabi` router.
- `apps/antalmanac/src/components/RightPane/SectionTable/SectionTable.tsx` — add `Syllabi` button after Past Enrollment.
- `apps/antalmanac/src/components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/SyllabusCell.tsx` — add icon button + popover; fix `webURL` prop type.
- `apps/antalmanac/src/lib/analytics/analytics.ts` — add `CLICK_SYLLABI` action.
- `packages/types/src/websoc.ts` (or a new `syllabi.ts`) — re-export `Syllabus` type once the anteater-api-types regenerate catches it, with a local shim until then.

## 10. Rollout & testing

- Local: run `docker-compose up` for the existing stack; point `fetchAnteaterAPI` at staging `anteaterapi.com` if PR #366 is deployed there, otherwise stub `syllabi.get` in a test router for unit work.
- Unit tests (`vitest`): `lib/syllabi.test.ts` for `groupByTerm`, `groupByProfessor`, `elevateForCurrent` — covers all four product cases above.
- Component test: render `SyllabiPopup` with fixtures for (a) empty, (b) current-quarter present, (c) only past, (d) co-taught + multi-section-same-term to assert grouping + chip elevation.
- Manual QA matrix:
    - `COMPSCI 161` (well-populated historical data, current-quarter likely exists).
    - A course that hasn't been offered in years (only past).
    - A brand-new course (empty response).
    - A course with known co-teaching (e.g. large lower-div with multiple sections).
- Feature flag: not required — the button degrades to an empty-state popover if the endpoint returns `[]` or 404.

## 11. Follow-ups out of scope

- Persisting the "By Quarter" vs "By Professor" toggle in user settings.
- Embedding a PDF preview of the syllabus (Canvas URLs usually require auth, so a link-out is the realistic UX).
- Backfilling syllabi that live outside Canvas (`webURL`s that point elsewhere) — the API already exposes whatever `websoc_section.web_url` contains, so this is an upstream concern.

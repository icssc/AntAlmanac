# Search router benchmarks

Microbenchmarks for the per-request cost of `getTermSectionCodes` and the
derived offered-course set used by `src/backend/routers/search.ts`.

## Running

From `apps/antalmanac`:

```bash
# Generate a synthetic 2 MB term file at src/generated/terms/2099_BENCHMARK.json
pnpm exec tsx scripts/benchmark/generate-synthetic-term.ts

# Run the benchmark (compares uncached baseline to cached implementation)
pnpm exec tsx scripts/benchmark/bench-term-data.ts
```

## What it measures

- `getTermSectionCodes`: read + parse the term JSON file.
- `getOfferedCourses`: build a `Set<"${dept}-${courseNumber}">` from the parsed sections.

These two operations dominate the per-request cost of `search.doSearch` and
`search.filterOfferedCourses`. The synthetic term mirrors the size of the
production latest term (~12,804 sections, ~2 MB JSON, see
`src/generated/deployed_terms.json`).

## Sample result on Node 22

```
## Uncached (current production behavior) ##
getTermSectionCodes (read+parse)   200 iters   ~9.5 ms/iter
getOfferedCourses (Set build)      200 iters   ~10 ms/iter

## Cached (after fix) ##
getTermSectionCodes (cached)       200 iters   ~0 ms/iter
getOfferedCourses (cached)         200 iters   ~0 ms/iter
```

Because term files are baked into the deployment artifact, the cache lives for
the lifetime of a Lambda container — every warm request after the first now
saves ~20 ms of pure CPU/IO overhead.

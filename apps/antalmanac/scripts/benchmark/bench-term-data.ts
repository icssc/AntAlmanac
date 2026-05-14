/**
 * Microbenchmark for the per-request cost of `getTermSectionCodes` and the
 * derived `offeredCourseSet` in `src/backend/routers/search.ts`.
 *
 * These two operations are the dominant cost of the `search.doSearch` and
 * `search.filterOfferedCourses` tRPC procedures: a 2+ MB JSON file is read
 * from disk and parsed, then a Set of `${department}-${courseNumber}` keys is
 * built by iterating every section.
 *
 * Run before and after the caching change to see the impact:
 *
 *   pnpm exec tsx scripts/benchmark/generate-synthetic-term.ts
 *   pnpm exec tsx scripts/benchmark/bench-term-data.ts
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';

import type { SectionSearchResult } from '@packages/antalmanac-types';

const TERMS_FOLDER = join(process.cwd(), 'src', 'generated', 'terms');
const YEAR = 'BENCHMARK';
const QUARTER = '2099';

// --- Reference implementations: copy of the production code as it exists
// before the caching patch. These mirror search.ts:71..88 exactly.

async function getTermSectionCodes_uncached(year: string, quarter: string) {
    const parsedTerm = `${quarter}_${year}`;
    const filePath = join(TERMS_FOLDER, `${parsedTerm}.json`);
    const fileContent = await readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as Record<string, SectionSearchResult>;
}

function getOfferedCourses_uncached(termSectionCodes: Record<string, SectionSearchResult>) {
    return new Set(Object.values(termSectionCodes).map((s) => `${s.department}-${s.courseNumber}`));
}

// --- Cached implementations: must match what we ship in
// `src/backend/lib/term-section-codes-cache.ts`. We import them dynamically
// after the module is added so this benchmark works for the baseline run too.

async function loadCachedImpl() {
    try {
        const mod = await import('../../src/backend/lib/term-section-codes-cache');
        return mod;
    } catch {
        return null;
    }
}

async function bench(label: string, iterations: number, fn: () => Promise<unknown> | unknown) {
    for (let i = 0; i < 3; i++) await fn();

    const start = performance.now();
    for (let i = 0; i < iterations; i++) await fn();
    const elapsed = performance.now() - start;

    console.log(
        `${label.padEnd(48)} | ${iterations.toString().padStart(5)} iters | ` +
            `${elapsed.toFixed(1).padStart(9)} ms total | ` +
            `${(elapsed / iterations).toFixed(3).padStart(8)} ms/iter`
    );
    return elapsed;
}

async function main() {
    console.log(`--- benchmark: term-data hot path (${YEAR} ${QUARTER}) ---`);

    const probe = await getTermSectionCodes_uncached(YEAR, QUARTER);
    console.log(`Section count in benchmark term: ${Object.keys(probe).length}`);
    console.log('');

    console.log('## Uncached (current production behavior) ##');
    const baseRead = await bench('getTermSectionCodes (read+parse)', 200, async () => {
        await getTermSectionCodes_uncached(YEAR, QUARTER);
    });
    const baseSet = await bench('getOfferedCourses (Set build)', 200, async () => {
        const t = await getTermSectionCodes_uncached(YEAR, QUARTER);
        getOfferedCourses_uncached(t);
    });

    console.log('');

    const cached = await loadCachedImpl();
    if (!cached) {
        console.log('(cached implementation not yet present — skipping post-fix run)');
        return;
    }

    console.log('## Cached (after fix) ##');
    const cachedRead = await bench('getTermSectionCodes (cached)', 200, async () => {
        await cached.getTermSectionCodes(YEAR, QUARTER);
    });
    const cachedSet = await bench('getOfferedCourses (cached)', 200, async () => {
        await cached.getOfferedCourses(YEAR, QUARTER);
    });

    console.log('');
    console.log('## Speedup ##');
    console.log(
        `getTermSectionCodes: ${(baseRead / cachedRead).toFixed(1)}x faster ` +
            `(${(baseRead / 200).toFixed(2)}ms -> ${(cachedRead / 200).toFixed(3)}ms)`
    );
    console.log(
        `getOfferedCourses:   ${(baseSet / cachedSet).toFixed(1)}x faster ` +
            `(${(baseSet / 200).toFixed(2)}ms -> ${(cachedSet / 200).toFixed(3)}ms)`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

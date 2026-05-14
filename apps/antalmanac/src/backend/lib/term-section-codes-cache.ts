import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { SectionSearchResult } from '@packages/antalmanac-types';

/**
 * In-process cache for term section-code data.
 *
 * Each tRPC `search.doSearch` / `search.filterOfferedCourses` call previously
 * re-read the corresponding term JSON from disk and rebuilt a Set of offered
 * `${department}-${courseNumber}` keys from scratch. For the latest term
 * (~12,804 sections, ~2 MB JSON) that's ~20 ms of pure CPU/IO overhead per
 * request, repeated on every keystroke in the search bar.
 *
 * Term files are baked into the deployment artifact (see
 * `scripts/get-search-data.ts`) and never change during the lifetime of a
 * server / Lambda container, so the data can be cached indefinitely.
 *
 * The cache stores the in-flight Promise (not just the resolved value) so
 * concurrent first-reads of the same term de-duplicate the disk read.
 */

export type TermSectionCodes = Record<string, SectionSearchResult>;

const DEFAULT_TERMS_FOLDER = join(process.cwd(), 'src', 'generated', 'terms');

let termsFolder = DEFAULT_TERMS_FOLDER;

const sectionCodesCache = new Map<string, Promise<TermSectionCodes>>();
const offeredCoursesCache = new Map<string, Promise<Set<string>>>();

function termKey(year: string, quarter: string): string {
    return `${quarter}_${year}`;
}

async function readTermFile(year: string, quarter: string): Promise<TermSectionCodes> {
    const parsedTerm = termKey(year, quarter);
    try {
        const filePath = join(termsFolder, `${parsedTerm}.json`);
        const fileContent = await readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (err) {
        throw new Error(`Failed to load term data for ${parsedTerm}: ${err}`);
    }
}

export function getTermSectionCodes(year: string, quarter: string): Promise<TermSectionCodes> {
    const key = termKey(year, quarter);
    let pending = sectionCodesCache.get(key);
    if (pending) return pending;

    pending = readTermFile(year, quarter).catch((err) => {
        // Don't poison the cache on failure — let the next request retry.
        sectionCodesCache.delete(key);
        throw err;
    });
    sectionCodesCache.set(key, pending);
    return pending;
}

export function getOfferedCourses(year: string, quarter: string): Promise<Set<string>> {
    const key = termKey(year, quarter);
    let pending = offeredCoursesCache.get(key);
    if (pending) return pending;

    pending = getTermSectionCodes(year, quarter)
        .then((termSectionCodes) => {
            const set = new Set<string>();
            for (const s of Object.values(termSectionCodes)) {
                set.add(`${s.department}-${s.courseNumber}`);
            }
            return set;
        })
        .catch((err) => {
            offeredCoursesCache.delete(key);
            throw err;
        });
    offeredCoursesCache.set(key, pending);
    return pending;
}

/**
 * Test-only helper to reset the caches between unit tests.
 */
export function _clearTermDataCacheForTests(): void {
    sectionCodesCache.clear();
    offeredCoursesCache.clear();
}

/**
 * Test-only helper to point the cache at an alternate terms folder. Pass `null`
 * to restore the default `${process.cwd()}/src/generated/terms`.
 */
export function _setTermsFolderForTests(folder: string | null): void {
    termsFolder = folder ?? DEFAULT_TERMS_FOLDER;
}

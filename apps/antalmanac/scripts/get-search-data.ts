import 'dotenv/config';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { termData } from '$lib/term';
import { canTermEnrollmentChange } from '$lib/termHelpers';
import type { AATerm, CourseSearchResult, DepartmentSearchResult } from '@packages/antalmanac-types';
import { AAPIError, createClient } from '@packages/anteater-api/client';
import type { Course, WebsocAPIResponse, WebsocCourse, WebsocDepartment } from '@packages/anteater-api/types';

import { parseSectionCodes, SectionCodesGraphQLResponse } from '../src/backend/lib/term-section-codes';
import { GENERATED_DIR, GENERATED_TERMS_DIR, SEARCH_DATA_FILE } from './lib/paths.js';

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

// Page size for `/v2/rest/courses` is hard-capped at 100 by AAPI.
const COURSES_PAGE_SIZE = 100;

/*
 * Concurrency caps for outbound AAPI traffic. AAPI's GraphQL `websoc` queries
 * for current-ish quarters are heavy (~1 MB / ~7 s) and have been observed to
 * trip Cloudflare Worker memory limits when fired in larger waves, so we keep
 * that pool small while letting the cheap REST `/courses` paginator run wider.
 */
const COURSES_PAGE_CONCURRENCY = 8;
const SECTION_CODES_CONCURRENCY = 3;

/*
 * Retry transient AAPI failures (HTTP 5xx, including the Cloudflare Worker
 * resource-limit error which surfaces as 503). The script otherwise aborts on
 * a single hiccup, which is painful when most of a long run has succeeded.
 */
const SECTION_CODES_MAX_ATTEMPTS = 4;
const SECTION_CODES_RETRY_BASE_MS = 1500;

const ALIASES: Record<string, string | undefined> = {
    COMPSCI: 'CS',
    EARTHSS: 'ESS',
    'I&C SCI': 'ICS',
    IN4MATX: 'INF',
};

function catalogCourseKey(department: string, courseNumber: string) {
    return `${department.trim()}::${courseNumber.trim()}`;
}

function getWebsocCoursesFromResponse(data: WebsocAPIResponse) {
    return new Map(
        data.schools.flatMap((school) =>
            school.departments.flatMap((dept) =>
                dept.courses.map((course) => [
                    catalogCourseKey(dept.deptCode, course.courseNumber),
                    {
                        deptCode: dept.deptCode,
                        deptName: dept.deptName,
                        courseNumber: course.courseNumber,
                        courseTitle: course.courseTitle,
                    },
                ])
            )
        )
    );
}

/**
 * Fetch section-code data for a term, retrying transient 5xx responses (notably AAPI's
 * Cloudflare Worker resource-limit error, which surfaces as 503) with exponential backoff.
 */
async function fetchSectionCodesWithRetry(term: AATerm) {
    const query = buildSectionCodesQuery(term);
    let lastError: unknown;
    for (let attempt = 1; attempt <= SECTION_CODES_MAX_ATTEMPTS; attempt++) {
        try {
            const res = await aapiClient.graphql<SectionCodesGraphQLResponse>(query);
            if (!res) {
                throw new Error(`Error fetching section codes for ${term.shortName}.`);
            }
            return res;
        } catch (error) {
            lastError = error;
            const isRetryable = error instanceof AAPIError && error.status !== undefined && error.status >= 500;
            if (!isRetryable || attempt === SECTION_CODES_MAX_ATTEMPTS) {
                throw error;
            }
            const delayMs = SECTION_CODES_RETRY_BASE_MS * 2 ** (attempt - 1);
            console.warn(
                `Transient AAPI error (${(error as AAPIError).status}) for ${term.shortName}; retrying in ${delayMs} ms (attempt ${attempt}/${SECTION_CODES_MAX_ATTEMPTS}).`
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw lastError;
}

/**
 * Run `worker` over `items` with at most `concurrency` in-flight tasks at once.
 * Preserves the original ordering for the returned results.
 */
async function runPool<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>) {
    const results: R[] = Array.from({ length: items.length });
    let cursor = 0;
    let aborted = false;
    const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (!aborted) {
            const i = cursor++;
            if (i >= items.length) return;
            try {
                results[i] = await worker(items[i], i);
            } catch (error) {
                aborted = true;
                throw error;
            }
        }
    });
    await Promise.all(runners);
    return results;
}

function buildSectionCodesQuery(term: AATerm): string {
    return `{
        websoc(query: { year: "${term.year}", quarter: ${term.quarter} }) {
            schools {
                departments {
                    deptCode
                    courses {
                        courseTitle
                        courseNumber
                        sections {
                            sectionCode
                            sectionType
                            sectionNum
                        }
                    }
                }
            }
        }
    }`;
}

async function main() {
    console.log('Generating cache for fuzzy search.');

    const activeTerms = termData.filter((t) => canTermEnrollmentChange(t));

    console.log('Fetching courses from Anteater API...');
    /*
     * Catalogue size isn't known up front and the API caps `take` at 100, so we fire pages in
     * concurrent waves and stop the moment any page in a wave returns a short batch (which means
     * we've reached the end of the catalogue).
     */
    const courses: Course[] = [];
    let waveStart = 0;
    let reachedEnd = false;
    while (!reachedEnd) {
        const skips = Array.from({ length: COURSES_PAGE_CONCURRENCY }, (_, i) => waveStart + i * COURSES_PAGE_SIZE);
        waveStart += COURSES_PAGE_CONCURRENCY * COURSES_PAGE_SIZE;
        const batches = await Promise.all(
            skips.map((skip) => aapiClient.courses.list({ take: COURSES_PAGE_SIZE, skip }))
        );
        for (const batch of batches) {
            courses.push(...batch);
            if (batch.length < COURSES_PAGE_SIZE) {
                reachedEnd = true;
            }
        }
    }
    console.log(`Fetched ${courses.length} courses.`);
    const courseMap = new Map<string, CourseSearchResult & { id: string }>();
    const deptMap = new Map<string, DepartmentSearchResult & { id: string }>();
    const catalogueKeys = new Set<string>();
    for (const course of courses) {
        courseMap.set(course.id, {
            id: course.id,
            type: 'COURSE',
            name: course.title,
            alias: ALIASES[course.department],
            metadata: {
                department: course.department,
                number: course.courseNumber,
            },
        });
        catalogueKeys.add(catalogCourseKey(course.department, course.courseNumber));
        deptMap.set(course.department, {
            id: course.department,
            type: 'DEPARTMENT',
            name: course.departmentName,
            alias: ALIASES[course.department],
        });
    }
    console.log(`Fetched ${deptMap.size} departments.`);

    await mkdir(GENERATED_DIR, { recursive: true });
    await mkdir(GENERATED_TERMS_DIR, { recursive: true });

    if (activeTerms.length > 0) {
        /*
         * WebSOC may receive updates sooner than the course catalogue updates, notably for a
         * new academic year (i.e. Fall term). Querying WebSOC to build course data ensures all
         * available courses are represented.
         *
         * Fetch WebSOC for each term where {@link canTermEnrollmentChange} is true and merge the
         * course lists: overlapping registration periods mean several quarters need data at once.
         */
        console.log(`Fetching WebSoc REST for union with catalogue: ${activeTerms.map((t) => t.shortName).join(', ')}`);

        const fromWebsoc = new Map<
            string,
            Pick<WebsocDepartment, 'deptCode' | 'deptName'> & Pick<WebsocCourse, 'courseNumber' | 'courseTitle'>
        >();
        const websocResponses = await Promise.all(
            activeTerms.map(({ year, quarter }) => aapiClient.websoc.query({ year, quarter }))
        );
        for (const websocData of websocResponses) {
            const chunk = getWebsocCoursesFromResponse(websocData);
            for (const [key, course] of chunk) {
                fromWebsoc.set(key, course);
            }
        }

        let addedFromWebsoc = 0;
        for (const [key, course] of fromWebsoc) {
            if (catalogueKeys.has(key)) {
                continue;
            }
            addedFromWebsoc += 1;
            const id = `ws:${course.deptCode}:${course.courseNumber}`;
            const name = (course.courseTitle ?? '').trim() || `${course.deptCode} ${course.courseNumber}`;
            courseMap.set(id, {
                id,
                type: 'COURSE',
                name,
                alias: ALIASES[course.deptCode],
                metadata: {
                    department: course.deptCode,
                    number: course.courseNumber,
                },
            });
            if (!deptMap.has(course.deptCode)) {
                deptMap.set(course.deptCode, {
                    id: course.deptCode,
                    type: 'DEPARTMENT',
                    name: (course.deptName ?? '').trim() || course.deptCode,
                    alias: ALIASES[course.deptCode],
                });
            }
        }
        console.log(`WebSoc union: ${fromWebsoc.size} courses in schedule, ${addedFromWebsoc} not in catalogue.`);
    } else {
        console.log('No active enrollment terms; skipping WebSOC union.');
    }

    await writeFile(
        SEARCH_DATA_FILE,
        JSON.stringify(
            {
                departments: Array.from(deptMap.values()),
                courses: Array.from(courseMap.values()),
            },
            null,
            2
        )
    );

    const refreshShortNames = new Set(activeTerms.map((t) => t.shortName));

    /*
     * Decide which terms still need section-code data. Terms whose JSON cache exists *and* aren't
     * inside an active-enrollment refresh window are skipped, since their section codes can no
     * longer change. The remaining terms are fetched concurrently via a bounded pool, which keeps
     * AAPI under controlled load while finishing cold rebuilds in seconds rather than minutes.
     */
    const termsToFetch: { term: AATerm; fileName: string }[] = [];
    for (const term of termData) {
        const fileName = join(GENERATED_TERMS_DIR, `${term.quarter}_${term.year}.json`);
        let cacheExists = false;
        try {
            await access(fileName);
            cacheExists = true;
        } catch {
            // Cache miss is the normal path on a fresh checkout.
        }

        if (cacheExists && !refreshShortNames.has(term.shortName)) {
            console.log(`Skipping ${term.shortName}, cache exists and term is outside enrollment refresh window.`);
            continue;
        }

        if (cacheExists) {
            console.log(`Updating section-code cache for active term (${term.shortName})...`);
        } else {
            console.log(`${term.shortName} doesn't exist in cache, rebuilding.`);
        }

        termsToFetch.push({ term, fileName });
    }

    const sectionCounts = await runPool(termsToFetch, SECTION_CODES_CONCURRENCY, async ({ term, fileName }) => {
        try {
            const res = await fetchSectionCodesWithRetry(term);
            const parsedSectionData = parseSectionCodes(res);
            const numKeys = Object.keys(parsedSectionData).length;

            console.log(`Fetched ${numKeys} section codes for ${term.shortName} from Anteater API.`);

            await writeFile(fileName, JSON.stringify(parsedSectionData, null, 2));
            return numKeys;
        } catch (error) {
            console.error(`ERROR for term "${term.shortName}":`);
            throw error;
        }
    });

    const count = sectionCounts.reduce((sum, n) => sum + n, 0);

    console.log(`Fetched ${count} section codes for ${termData.length} terms from Anteater API.`);
    console.log('Cache generated.');
}

main();

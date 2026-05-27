import 'dotenv/config';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { termData } from '$lib/term';
import { canTermEnrollmentChange } from '$lib/termHelpers';
import type { AATerm, CourseSearchResult, DepartmentSearchResult } from '@packages/antalmanac-types';
import { createClient } from '@packages/anteater-api/client';
import type { Course, WebsocAPIResponse, WebsocCourse, WebsocDepartment } from '@packages/anteater-api/types';

import { parseSectionCodes, SectionCodesGraphQLResponse } from '../src/backend/lib/term-section-codes';
import { GENERATED_DIR, GENERATED_TERMS_DIR, SEARCH_DATA_FILE } from './lib/paths.js';

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

const MAX_COURSES = 10_000;

const ALIASES: Record<string, string | undefined> = {
    COMPSCI: 'CS',
    EARTHSS: 'ESS',
    'I&C SCI': 'ICS',
    IN4MATX: 'INF',
};

type CourseEntry = CourseSearchResult & { id: string };
type DepartmentEntry = DepartmentSearchResult & { id: string };
type WebsocCourseInfo = Pick<WebsocDepartment, 'deptCode' | 'deptName'> &
    Pick<WebsocCourse, 'courseNumber' | 'courseTitle'>;

const catalogCourseKey = (department: string, courseNumber: string) => `${department.trim()}::${courseNumber.trim()}`;

const sectionCacheFile = (term: AATerm) => join(GENERATED_TERMS_DIR, `${term.quarter}_${term.year}.json`);

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

function websocCourses(data: WebsocAPIResponse): Map<string, WebsocCourseInfo> {
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

async function fetchAllCourses(): Promise<Course[]> {
    const courses: Course[] = [];
    for (let skip = 0; skip < MAX_COURSES; skip += 100) {
        const batch = await aapiClient.courses.list({ take: 100, skip });
        courses.push(...batch);
        if (batch.length < 100) {
            break;
        }
    }
    return courses;
}

function buildCatalogue(courses: Course[]) {
    const courseMap = new Map<string, CourseEntry>();
    const deptMap = new Map<string, DepartmentEntry>();
    const catalogueKeys = new Set<string>();

    for (const course of courses) {
        courseMap.set(course.id, {
            id: course.id,
            type: 'COURSE',
            name: course.title,
            alias: ALIASES[course.department],
            metadata: { department: course.department, number: course.courseNumber },
        });
        catalogueKeys.add(catalogCourseKey(course.department, course.courseNumber));
        deptMap.set(course.department, {
            id: course.department,
            type: 'DEPARTMENT',
            name: course.departmentName,
            alias: ALIASES[course.department],
        });
    }

    return { courseMap, deptMap, catalogueKeys };
}

/*
 * WebSOC may update before the course catalogue (notably for a new academic year), so union the
 * schedule's courses (across every term whose enrollment can still change) into the catalogue.
 */
async function unionWebsocCourses(
    activeTerms: AATerm[],
    courseMap: Map<string, CourseEntry>,
    deptMap: Map<string, DepartmentEntry>,
    catalogueKeys: Set<string>
) {
    console.log(`Fetching WebSoc REST for union with catalogue: ${activeTerms.map((t) => t.shortName).join(', ')}`);

    const fromWebsoc = new Map<string, WebsocCourseInfo>();
    for (const { year, quarter } of activeTerms) {
        const response = await aapiClient.websoc.query({ year, quarter });
        for (const [key, course] of websocCourses(response)) {
            fromWebsoc.set(key, course);
        }
    }

    let added = 0;
    for (const [key, course] of fromWebsoc) {
        if (catalogueKeys.has(key)) {
            continue;
        }
        added += 1;
        const id = `ws:${course.deptCode}:${course.courseNumber}`;
        courseMap.set(id, {
            id,
            type: 'COURSE',
            name: (course.courseTitle ?? '').trim() || `${course.deptCode} ${course.courseNumber}`,
            alias: ALIASES[course.deptCode],
            metadata: { department: course.deptCode, number: course.courseNumber },
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

    console.log(`WebSoc union: ${fromWebsoc.size} courses in schedule, ${added} not in catalogue.`);
}

/** Terms needing a (re)fetch: missing caches, plus active terms within the enrollment refresh window. */
async function selectTermsToFetch(activeShortNames: Set<string>): Promise<AATerm[]> {
    const selected: AATerm[] = [];
    for (const term of termData) {
        const cached = await access(sectionCacheFile(term)).then(
            () => true,
            () => false
        );
        if (cached && !activeShortNames.has(term.shortName)) {
            console.log(`Skipping ${term.shortName}, cache exists and term is outside enrollment refresh window.`);
            continue;
        }
        console.log(
            cached
                ? `Updating section-code cache for active term (${term.shortName})...`
                : `${term.shortName} doesn't exist in cache, rebuilding.`
        );
        selected.push(term);
    }
    return selected;
}

/*
 * Fetch sequentially: AAPI's Cloudflare Worker OOMs (error 1102) when these heavy GraphQL queries
 * run concurrently. In steady state only the few active terms are refreshed, so this stays fast.
 */
async function writeSectionCodeCaches(terms: AATerm[]): Promise<number> {
    let count = 0;
    for (const term of terms) {
        const res = await aapiClient.graphql<SectionCodesGraphQLResponse>(buildSectionCodesQuery(term));
        if (!res) {
            throw new Error(`Error fetching section codes for ${term.shortName}.`);
        }
        const sectionData = parseSectionCodes(res);
        const numKeys = Object.keys(sectionData).length;
        console.log(`Fetched ${numKeys} section codes for ${term.shortName} from Anteater API.`);
        await writeFile(sectionCacheFile(term), JSON.stringify(sectionData, null, 2));
        count += numKeys;
    }
    return count;
}

async function main() {
    console.log('Generating cache for fuzzy search.');

    const activeTerms = termData.filter((t) => canTermEnrollmentChange(t));

    console.log('Fetching courses from Anteater API...');
    const courses = await fetchAllCourses();
    console.log(`Fetched ${courses.length} courses.`);

    const { courseMap, deptMap, catalogueKeys } = buildCatalogue(courses);
    console.log(`Fetched ${deptMap.size} departments.`);

    await mkdir(GENERATED_DIR, { recursive: true });
    await mkdir(GENERATED_TERMS_DIR, { recursive: true });

    if (activeTerms.length > 0) {
        await unionWebsocCourses(activeTerms, courseMap, deptMap, catalogueKeys);
    } else {
        console.log('No active enrollment terms; skipping WebSOC union.');
    }

    await writeFile(
        SEARCH_DATA_FILE,
        JSON.stringify({ departments: [...deptMap.values()], courses: [...courseMap.values()] }, null, 2)
    );

    const activeShortNames = new Set(activeTerms.map((t) => t.shortName));
    const count = await writeSectionCodeCaches(await selectTermsToFetch(activeShortNames));

    console.log(`Fetched ${count} section codes for ${termData.length} terms from Anteater API.`);
    console.log('Cache generated.');
}

main();

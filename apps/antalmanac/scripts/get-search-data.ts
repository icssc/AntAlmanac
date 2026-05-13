import 'dotenv/config';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { canTermEnrollmentChange, termData } from '$lib/term';
import type { CourseSearchResult, DepartmentSearchResult } from '@packages/antalmanac-types';
import { createClient } from '@packages/anteater-api/client';
import type { Course, WebsocAPIResponse, WebsocCourse, WebsocDepartment } from '@packages/anteater-api/types';

import { parseSectionCodes, SectionCodesGraphQLResponse } from '../src/backend/lib/term-section-codes';
import { GENERATED_DIR, GENERATED_TERMS_DIR, SEARCH_DATA_FILE } from './lib/paths.js';

const aapiClient = createClient({ apiKey: process.env.ANTEATER_API_KEY });

const MAX_COURSES = 10_000;

// Delay between GraphQL requests to avoid triggering AAPI rate limits / OOM.
const DELAY_MS = 500;

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

function buildSectionCodesQuery(year: string, quarter: string): string {
    return `{
        websoc(query: { year: "${year}", quarter: ${quarter} }) {
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

    const activeTerms = termData.filter((t) => canTermEnrollmentChange(t.shortName));

    console.log('Fetching courses from Anteater API...');
    const courses: Course[] = [];
    for (let skip = 0; skip < MAX_COURSES; skip += 100) {
        const batch = await aapiClient.courses.list({ take: 100, skip });
        courses.push(...batch);

        if (batch.length < 100) {
            break;
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
        for (let i = 0; i < activeTerms.length; i++) {
            if (i > 0) {
                await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
            }
            const { year, quarter } = activeTerms[i];
            const websocData = await aapiClient.websoc.query({ year, quarter });
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
    let count = 0;

    /*
     * Fetch section-code data one term at a time with a fixed delay between requests.
     * Sequential execution (rather than staggered Promise.all) ensures we never have
     * concurrent in-flight GraphQL calls, which matters while AAPI has OOM constraints.
     */
    let requestsMade = 0;
    for (const term of termData) {
        try {
            const { year, quarter } = term;
            const parsedTerm = `${quarter}_${year}`;
            const fileName = join(GENERATED_TERMS_DIR, `${parsedTerm}.json`);

            try {
                await access(fileName);

                if (!refreshShortNames.has(term.shortName)) {
                    console.log(
                        `Skipping ${term.shortName}, cache exists and term is outside enrollment refresh window.`
                    );
                    continue;
                }
                console.log(`Updating section-code cache for active term (${term.shortName})...`);
            } catch {
                console.log(`${term.shortName} doesn't exist in cache, rebuilding.`);
            }

            // Stagger requests to respect AAPI rate limits / avoid OOM
            if (requestsMade > 0) {
                await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
            }
            requestsMade++;

            const query = buildSectionCodesQuery(year, quarter);
            const res = await aapiClient.graphql<SectionCodesGraphQLResponse>(query);
            if (!res) {
                throw new Error(`Error fetching section codes for ${term.shortName}.`);
            }

            const parsedSectionData = parseSectionCodes(res);
            const numKeys = Object.keys(parsedSectionData).length;

            console.log(`Fetched ${numKeys} section codes for ${term.shortName} from Anteater API.`);

            await writeFile(fileName, JSON.stringify(parsedSectionData, null, 2));
            count += numKeys;
        } catch (error) {
            console.error(`ERROR for term "${term.shortName}":`);
            throw error;
        }
    }

    console.log(`Fetched ${count} section codes for ${termData.length} terms from Anteater API.`);
    console.log('Cache generated.');
}

main();

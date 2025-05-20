import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { Course, CourseSearchResult, DepartmentSearchResult } from '@packages/antalmanac-types';
import { queryGraphQL } from 'src/lib/helpers';
import { parseSectionCodes, SectionCodesGraphQLResponse, termData } from 'src/lib/term-section-codes';

import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MAX_COURSES = 10_000;

const ALIASES: Record<string, string | undefined> = {
    COMPSCI: 'CS',
    EARTHSS: 'ESS',
    'I&C SCI': 'ICS',
    IN4MATX: 'INF',
};

async function main() {
    const apiKey = process.env.ANTEATER_API_KEY;
    if (!apiKey) throw new Error('ANTEATER_API_KEY is required');
    console.log('Generating cache for fuzzy search.');
    console.log('Fetching courses from Anteater API...');
    const headers = { Authorization: `Bearer ${apiKey}` };
    const courses: Course[] = [];
    for (let skip = 0; skip < MAX_COURSES; skip += 100) {
        await fetch(`https://anteaterapi.com/v2/rest/courses?take=100&skip=${skip}`, { headers })
            .then((x) => x.json())
            .then((x) => courses.push(...(x.data as Course[])));
    }
    console.log(`Fetched ${courses.length} courses.`);
    const courseMap = new Map<string, CourseSearchResult & { id: string }>();
    const deptMap = new Map<string, DepartmentSearchResult & { id: string }>();
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
        deptMap.set(course.department, {
            id: course.department,
            type: 'DEPARTMENT',
            name: course.departmentName,
            alias: ALIASES[course.department],
        });
    }
    console.log(`Fetched ${deptMap.size} departments.`);

    const QUERY_TEMPLATE = `{
        websoc(query: {year: "$$YEAR$$", quarter: $$QUARTER$$}) {
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
    await mkdir(join(__dirname, '../src/generated/'), { recursive: true });
    await mkdir(join(__dirname, '../src/generated/terms/'), { recursive: true });
    await writeFile(
        join(__dirname, '../src/generated/searchData.ts'),
        `
    import type { CourseSearchResult, DepartmentSearchResult } from "@packages/antalmanac-types";
    export const departments: Array<DepartmentSearchResult & { id: string }> = ${JSON.stringify(
        Array.from(deptMap.values())
    )};
    export const courses: Array<CourseSearchResult & { id: string }> = ${JSON.stringify(
        Array.from(courseMap.values())
    )};
    `
    );
    let count = 0;
    for (const term of termData) {
        const [year, quarter] = term.shortName.split(' ');
        const parsedTerm = `${quarter}_${year}`;
        const query = QUERY_TEMPLATE.replace('$$YEAR$$', year).replace('$$QUARTER$$', quarter);
        const res = await queryGraphQL<SectionCodesGraphQLResponse>(query);
        if (!res) {
            throw new Error('Error fetching section codes.');
        }
        const parsedSectionData = parseSectionCodes(res);
        console.log(
            `Fetched ${Object.keys(parsedSectionData).length} course codes for ${term.shortName} from Anteater API.`
        );
        count += Object.keys(parsedSectionData).length;

        const fileName = join(__dirname, `../src/generated/terms/${parsedTerm}.json`);
        await writeFile(fileName, JSON.stringify(parsedSectionData, null, 2));
    }
    console.log(`Fetched ${count} course codes for ${termData.length} terms from Anteater API.`);
    console.log('Cache generated.');
}

main().then();

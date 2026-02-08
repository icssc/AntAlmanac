import { mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Course, CourseSearchResult, DepartmentSearchResult } from '@packages/antalmanac-types';

import { parseSectionCodes, termData } from '../src/backend/lib/term-section-codes';

import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MAX_COURSES = 10_000;
const VALID_CACHE_TIME_DAYS = 14;
const DELAY_MS = 500; // avoid rate limits from AAPI

const ALIASES: Record<string, string | undefined> = {
    COMPSCI: 'CS',
    EARTHSS: 'ESS',
    'I&C SCI': 'ICS',
    IN4MATX: 'INF',
};

async function main() {
    const apiKey = process.env.ANTEATER_API_KEY;
    if (!apiKey) throw new Error('ANTEATER_API_KEY is required');

    try {
        const cacheFolderStatistics = await stat(join(__dirname, '../src/generated/searchData.ts'));

        const lastModifiedDate = cacheFolderStatistics.mtime;
        const currentDate = new Date();
        const validCacheMs = VALID_CACHE_TIME_DAYS * 24 * 60 * 60 * 1000;

        if (process.env.STAGE == 'local' && currentDate.getTime() - lastModifiedDate.getTime() < validCacheMs) {
            console.log('Using existing search cache, last updated ' + lastModifiedDate.toLocaleString() + '.');
            return;
        }
    } catch {
        console.log('Cache is empty or unreachable, rebuilding from scratch...');
    }

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
    // Process terms sequentially to avoid memory exhaustion
    for (let index = 0; index < termData.length; index++) {
        const term = termData[index];
        try {
            const [year, quarter] = term.shortName.split(' ');
            const parsedTerm = `${quarter}_${year}`;

            // TODO (@kevin): remove delay once AAPI resolves OOM issues
            await new Promise((resolve) => setTimeout(resolve, DELAY_MS * index));

            // Use REST API instead of GraphQL
            const params = new URLSearchParams({ year, quarter });
            const url = `https://anteaterapi.com/v2/rest/websoc?${params}`;
            const response = await fetch(url, { headers });
            const restApiResponse = await response.json();

            if (!restApiResponse.ok || !restApiResponse.data) {
                throw new Error(`Error fetching section codes for ${term.shortName}.`);
            }

            const parsedSectionData = parseSectionCodes(restApiResponse.data);
            console.log(
                `Fetched ${Object.keys(parsedSectionData).length} section codes for ${
                    term.shortName
                } from Anteater API.`
            );

            const fileName = join(__dirname, `../src/generated/terms/${parsedTerm}.json`);
            await writeFile(fileName, JSON.stringify(parsedSectionData));
            count += Object.keys(parsedSectionData).length;
        } catch (error) {
            console.error(`ERROR processing term "${term.shortName}":`);
            console.error(`Term details:`, {
                shortName: term.shortName,
                year: term.shortName.split(' ')[0],
                quarter: term.shortName.split(' ')[1],
                index,
            });

            throw error;
        }
    }

    console.log(`Fetched ${count} section codes for ${termData.length} terms from Anteater API.`);
    console.log('Cache generated.');
}

main().then();

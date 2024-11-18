import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import {Course, CourseSearchResult, DepartmentSearchResult} from '@packages/antalmanac-types';

import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MAX_COURSES = 10_000;

const ALIASES: Record<string, string | undefined> = {
    "COMPSCI": "CS",
    "EARTHSS": "ESS",
    "I&C SCI": "ICS",
    "IN4MATX": "INF",
}

// blah

async function main() {
    const apiKey = process.env.ANTEATER_API_KEY;
    if (!apiKey) throw new Error("ANTEATER_API_KEY is required");
    console.log("Generating cache for fuzzy search.");
    console.log("Fetching courses from Anteater API...");
    const headers = { Authorization: `Bearer ${apiKey}` }
    const courses: Course[] = [];
    for (let skip = 0; skip < MAX_COURSES; skip += 100) {
        await fetch(`https://anteaterapi.com/v2/rest/courses?take=100&skip=${skip}`, {headers})
            .then(x => x.json())
            .then(x => courses.push(...x.data as Course[]))
    }
    console.log(`Fetched ${courses.length} courses.`);
    const courseMap = new Map<string, CourseSearchResult & { id: string }>();
    const deptMap = new Map<string, DepartmentSearchResult & { id: string }>();
    for (const course of courses) {
        courseMap.set(course.id, {
            id: course.id,
            type: "COURSE",
            name: course.title,
            alias: ALIASES[course.department],
            metadata: {
                department: course.department,
                number: course.courseNumber,
            }
        })
        deptMap.set(course.department, {
            id: course.department,
            type: "DEPARTMENT",
            name: course.departmentName,
            alias: ALIASES[course.department]
        });
    }
    console.log(`Fetched ${deptMap.size} departments.`);
    await mkdir(join(__dirname, "../src/generated/"), { recursive: true });
    await writeFile(join(__dirname, "../src/generated/searchData.ts"), `
    import type { CourseSearchResult, DepartmentSearchResult } from "@packages/antalmanac-types";
    export const departments: Array<DepartmentSearchResult & { id: string }> = ${JSON.stringify(Array.from(deptMap.values()))};
    export const courses: Array<CourseSearchResult & { id: string }> = ${JSON.stringify(Array.from(courseMap.values()))};
    `)
    console.log("Cache generated.");
}

main().then();

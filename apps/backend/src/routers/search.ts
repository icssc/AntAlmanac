import { readFile } from 'fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import type { GESearchResult, SearchResult, SectionSearchResult } from '@packages/antalmanac-types';
import uFuzzy from '@leeoniya/ufuzzy';
import * as fuzzysort from 'fuzzysort';
import { procedure, router } from '../trpc';
import { backendEnvSchema, ppEnvSchema } from '../env';
import * as searchData from '$generated/searchData';

const MAX_AUTOCOMPLETE_RESULTS = 12;

const env = backendEnvSchema.parse(process.env);
const isLambda = env.STAGE !== 'local';

const termsFolderPath = isLambda ? '/var/task/terms' : join(process.cwd(), 'src', 'generated', 'terms');

const geCategoryKeys = ['ge1a', 'ge1b', 'ge2', 'ge3', 'ge4', 'ge5a', 'ge5b', 'ge6', 'ge7', 'ge8'] as const;

type GECategoryKey = (typeof geCategoryKeys)[number];

const geCategories: Record<GECategoryKey, GESearchResult> = {
    ge1a: { type: 'GE_CATEGORY', name: 'Lower Division Writing' },
    ge1b: { type: 'GE_CATEGORY', name: 'Upper Division Writing' },
    ge2: { type: 'GE_CATEGORY', name: 'Science and Technology' },
    ge3: { type: 'GE_CATEGORY', name: 'Social and Behavioral Sciences' },
    ge4: { type: 'GE_CATEGORY', name: 'Arts and Humanities' },
    ge5a: { type: 'GE_CATEGORY', name: 'Quantitative Literacy' },
    ge5b: { type: 'GE_CATEGORY', name: 'Formal Reasoning' },
    ge6: { type: 'GE_CATEGORY', name: 'Language other than English' },
    ge7: { type: 'GE_CATEGORY', name: 'Multicultural Studies' },
    ge8: { type: 'GE_CATEGORY', name: 'International/Global Issues' },
};

const PETERPORTAL_API_URL = "https://peterportal.org/api/trpc/external.roadmaps.getByGoogleID";

const toGESearchResult = (key: GECategoryKey): [string, SearchResult] => [
    key.toUpperCase().replace('GE', 'GE-'),
    geCategories[key],
];

const toMutable = <T>(arr: readonly T[]): T[] => arr as T[];

function getCurrentTerm(): { year: number; quarter: string } {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const quarter =
        month >= 1 && month <= 3
            ? 'Winter'
            : month >= 4 && month <= 6
            ? 'Spring'
            : month >= 7 && month <= 9
            ? 'Summer'
            : 'Fall';
    return { year, quarter };
}

async function fetchUserCoursesPeterPortal(userId: string): Promise<Set<string>> {
    const { year, quarter } = getCurrentTerm();
    const env = ppEnvSchema.parse(process.env);
    const apiKey = env.PETERPORTAL_CLIENT_API_KEY;
    if (!apiKey) throw new Error("PETERPORTAL_CLIENT_API_KEY is required");
    const searchParams = new URLSearchParams({ input: JSON.stringify({ googleUserId: userId }) });
    const url = `${PETERPORTAL_API_URL}?${searchParams.toString()}`;
    try {

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
        });

        if(!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);

        const data = await response.json();
        const coursesTaken = new Set<string>();

        for (const yearData of data.result.data[0].content) {
            for (const quarterData of yearData.quarters) {
                quarterData.courses.forEach(course => coursesTaken.add(course));
                if (yearData.startYear === year && quarterData.name === quarter) {
                    return coursesTaken;
                }
            }
        }

        return coursesTaken;
    } catch (error) {
        return new Set();
    }
}

const searchRouter = router({
    doSearch: procedure
        .input(z.object({ query: z.string(), term: z.string() }))
        .query(async ({ input }): Promise<Record<string, SearchResult>> => {
            const { query } = input;
            const [year, quarter] = input.term.split(' ');
            const parsedTerm = `${quarter}_${year}`;

            let termSectionCodes: Record<string, SectionSearchResult>;
            try {
                const filePath = join(termsFolderPath, `${parsedTerm}.json`);
                const fileContent = await readFile(filePath, 'utf-8');
                termSectionCodes = JSON.parse(fileContent);
            } catch (err) {
                throw new Error(`Failed to load term data for ${parsedTerm}: ${err}`);
            }

            const num = Number(input.query);
            const matchedSections: SectionSearchResult[] = [];
            if (!isNaN(num) && num >= 0 && Number.isInteger(num)) {
                const baseCourseCode = input.query;
                if (input.query.length === 4) {
                    for (let i = 0; i < 10; i++) {
                        const possibleCourseCode = `${baseCourseCode}${i}`;
                        if (termSectionCodes[possibleCourseCode]) {
                            matchedSections.push(termSectionCodes[possibleCourseCode]);
                        }
                    }
                } else if (input.query.length === 5) {
                    if (termSectionCodes[baseCourseCode]) {
                        matchedSections.push(termSectionCodes[baseCourseCode]);
                    }
                }
            }

            const u = new uFuzzy();
            const matchedGEs = u.search(toMutable(geCategoryKeys), query)[0]?.map((i) => geCategoryKeys[i]) ?? [];
            if (matchedGEs.length) return Object.fromEntries(matchedGEs.map(toGESearchResult));

            const matchedDepts =
                matchedSections.length === MAX_AUTOCOMPLETE_RESULTS
                    ? []
                    : fuzzysort.go(query, searchData.departments, {
                          keys: ['id', 'alias'],
                          limit: MAX_AUTOCOMPLETE_RESULTS - matchedSections.length,
                      });

            const matchedCourses =
                matchedSections.length + matchedDepts.length === MAX_AUTOCOMPLETE_RESULTS
                    ? []
                    : fuzzysort.go(query, searchData.courses, {
                          keys: ['id', 'name', 'alias', 'metadata.department', 'metadata.number'],
                          limit: MAX_AUTOCOMPLETE_RESULTS - matchedDepts.length - matchedSections.length,
                      });
    
            let results = [
                ...matchedSections.map((x) => [x.sectionCode, x]),
                ...matchedDepts.map(x => [x.obj.id, x.obj]),
                ...matchedCourses.map(x => [x.obj.id, x.obj]),
            ]

            return Object.fromEntries(results);
        }),

    fetchUserCoursesPeterPortal: procedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
            return await fetchUserCoursesPeterPortal(input.userId);
        }),
});

export default searchRouter;

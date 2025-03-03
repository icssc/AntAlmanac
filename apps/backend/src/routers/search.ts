import { z } from 'zod';
import type { GESearchResult, SearchResult } from '@packages/antalmanac-types';
import uFuzzy from '@leeoniya/ufuzzy';
import * as fuzzysort from "fuzzysort";
import { procedure, router } from '../trpc';
import {courses, departments} from "../generated/searchData";
import { backendEnvSchema } from 'src/env';

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

async function fetchUserCoursesPeterPortal(userId: string): Promise<Set<string>> {
    const env = backendEnvSchema.parse(process.env);
    const apiKey = env.PETERPORTAL_API_KEY;
    if (!apiKey) throw new Error("PETERPORTAL_API_KEY is required");
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
    
        for (const roadmap of data.result.data) {
            for (const year of roadmap.content) {
                for (const quarter of year.quarters) {
                    quarter.courses.forEach(course => coursesTaken.add(course));
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
        .input(z.object({ query: z.string() }))
        .query(async ({ input }): Promise<Record<string, SearchResult>> => {
            const { query } = input;
            const u = new uFuzzy();
            const matchedGEs = u.search(toMutable(geCategoryKeys), query)[0]?.map((i) => geCategoryKeys[i]) ?? [];
            if (matchedGEs.length) return Object.fromEntries(matchedGEs.map(toGESearchResult));
            const matchedDepts = fuzzysort.go(query, departments, {
                keys: ['id', 'alias'],
                limit: 10
            })
            const matchedCourses = matchedDepts.length === 10 ? [] : fuzzysort.go(query, courses, {
                keys: ['id', 'name', 'alias', 'metadata.department', 'metadata.number'],
                limit: 10 - matchedDepts.length
            })
            let results = [
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
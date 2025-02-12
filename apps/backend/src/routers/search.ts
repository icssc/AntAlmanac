import { z } from 'zod';
import type { GESearchResult, SearchResult } from '@packages/antalmanac-types';
import uFuzzy from '@leeoniya/ufuzzy';
import * as fuzzysort from "fuzzysort";
import { procedure, router } from '../trpc';
import {courses, departments} from "../generated/searchData";

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

const toGESearchResult = (key: GECategoryKey): [string, SearchResult] => [
    key.toUpperCase().replace('GE', 'GE-'),
    geCategories[key],
];

const toMutable = <T>(arr: readonly T[]): T[] => arr as T[];

const searchRouter = router({
    doSearch: procedure
        .input(z.object({ 
            query: z.string(),
            userId: z.string().optional(),
            filterTakenClasses: z.boolean().optional()
        }))
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

            console.log("Initial Search Results:", results.map(([id, obj]) => obj.name || obj.id));

            if (filterTakenClasses) {
                // const userCourses = await fetchUserCoursesPeterPortal(userId);
                const userCourses = new Set(['MATH 2A', 'CS 161', 'BIO SCI 93']);
                console.log("User's Taken Courses (for filtering):", Array.from(userCourses));
                results = results.filter(([id, obj]) => {
                    if (obj.type === 'COURSE') {
                        const courseKey = `${obj.metadata.department} ${obj.metadata.number}`;
                        return !userCourses.has(courseKey);
                    }
                    return true;
                });
                console.log("Filtered Results:", results.map(([id, obj]) => obj.name || obj.id));
            }
            return Object.fromEntries(results);
        }),
});

export default searchRouter;
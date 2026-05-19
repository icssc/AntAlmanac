import { readFile } from 'fs/promises';
import { join } from 'node:path';

// eslint-disable-next-line import/no-unresolved
import _searchData from '$generated/searchData.json';
import {
    type GESearchResult,
    type SearchResult,
    type SectionSearchResult,
    WebsocSearchInputSchema,
} from '@packages/antalmanac-types';
import * as fuzzysort from 'fuzzysort';
import { z } from 'zod';

import { procedure, router } from '../trpc';

const departmentSchema = z.object({
    id: z.string(),
    type: z.literal('DEPARTMENT'),
    name: z.string(),
    alias: z.string().optional(),
});

const courseSchema = z.object({
    id: z.string(),
    type: z.literal('COURSE'),
    name: z.string(),
    alias: z.string().optional(),
    metadata: z.object({
        department: z.string(),
        number: z.string(),
    }),
    isOffered: z.boolean().optional(),
});

const searchDataSchema = z.object({
    departments: z.array(departmentSchema),
    courses: z.array(courseSchema),
});

const searchData = searchDataSchema.parse(_searchData);

const MAX_AUTOCOMPLETE_RESULTS = 12;

const termsFolderPath = join(process.cwd(), 'src', 'generated', 'terms');

const geCategoryKeys = ['ge1a', 'ge1b', 'ge2', 'ge3', 'ge4', 'ge5a', 'ge5b', 'ge6', 'ge7', 'ge8'] as const;

type GECategoryKey = (typeof geCategoryKeys)[number];

const bareCourseSchema = z.object({
    department: z.string(),
    courseNumber: z.string(),
});

type BareCourse = z.infer<typeof bareCourseSchema>;

const termInputSchema = WebsocSearchInputSchema.pick({ year: true, quarter: true });
type SearchTermInput = z.infer<typeof termInputSchema>;

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

async function getTermSectionCodes(term: SearchTermInput): Promise<Record<string, SectionSearchResult>> {
    const parsedTerm = `${term.quarter}_${term.year}`;

    try {
        const filePath = join(termsFolderPath, `${parsedTerm}.json`);
        const fileContent = await readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (err) {
        throw new Error(`Failed to load term data for ${parsedTerm}: ${err}`);
    }
}

function getOfferedCourses(termSectionCodes: Awaited<ReturnType<typeof getTermSectionCodes>>) {
    return new Set(Object.values(termSectionCodes).map((s) => `${s.department}-${s.courseNumber}`));
}

const isCourseOffered = (department: string, courseNumber: string, offeredCourseSet: Set<string>): boolean => {
    return offeredCourseSet.has(`${department}-${courseNumber}`);
};

const searchRouter = router({
    doSearch: procedure
        .input(z.object({ query: z.string(), term: termInputSchema }))
        .query(async ({ input }): Promise<Record<string, SearchResult>> => {
            const { query, term } = input;

            const termSectionCodes = await getTermSectionCodes(term);

            const offeredCourseSet = getOfferedCourses(termSectionCodes);

            const num = Number(input.query);
            const matchedSections: SectionSearchResult[] = [];
            if (!isNaN(num) && num >= 0 && Number.isInteger(num)) {
                const baseSectionCode = input.query;
                if (input.query.length === 4) {
                    for (let i = 0; i < 10; i++) {
                        const possibleSectionCode = `${baseSectionCode}${i}`;
                        if (termSectionCodes[possibleSectionCode]) {
                            matchedSections.push(termSectionCodes[possibleSectionCode]);
                        }
                    }
                } else if (input.query.length === 5) {
                    if (termSectionCodes[baseSectionCode]) {
                        matchedSections.push(termSectionCodes[baseSectionCode]);
                    }
                }
            }

            const matchedGEs = fuzzysort
                .go(query, [...geCategoryKeys])
                .map((r) => r.target)
                .filter((t): t is GECategoryKey => t in geCategories);
            if (matchedGEs.length) return Object.fromEntries(matchedGEs.map(toGESearchResult));

            const matchedDepts =
                matchedSections.length === MAX_AUTOCOMPLETE_RESULTS
                    ? []
                    : fuzzysort.go(query, searchData.departments, {
                          keys: ['id', 'name', 'alias'],
                          limit: MAX_AUTOCOMPLETE_RESULTS - matchedSections.length,
                          threshold: 0.7,
                      });

            const matchedCourses =
                matchedSections.length + matchedDepts.length === MAX_AUTOCOMPLETE_RESULTS
                    ? []
                    : fuzzysort
                          .go(query, searchData.courses, {
                              keys: ['id', 'name', 'alias', 'metadata.department', 'metadata.number'],
                              limit: 100,
                          })
                          .map((course) => {
                              return {
                                  ...course,
                                  obj: {
                                      ...course.obj,
                                      isOffered: isCourseOffered(
                                          course.obj.metadata.department,
                                          course.obj.metadata.number,
                                          offeredCourseSet
                                      ),
                                  },
                              };
                          })
                          .sort((a, b) => {
                              if (a.obj.isOffered === b.obj.isOffered) return 0;
                              return a.obj.isOffered ? -1 : 1;
                          })
                          .slice(0, MAX_AUTOCOMPLETE_RESULTS - matchedDepts.length - matchedSections.length);

            return Object.fromEntries([
                ...matchedSections.map((x) => [x.sectionCode, x]),
                ...matchedDepts.map((x) => [x.obj.id, x.obj]),
                ...matchedCourses.map((x) => [x.obj.id, x.obj]),
            ]);
        }),
    filterOfferedCourses: procedure
        .input(
            z.object({
                courses: z.array(bareCourseSchema),
                term: termInputSchema,
            })
        )
        .query(async ({ input }): Promise<Record<BareCourse['department'], Set<BareCourse['courseNumber']>>> => {
            const { courses, term } = input;
            const termSectionCodes = await getTermSectionCodes(term);
            const offeredCourseSet = getOfferedCourses(termSectionCodes);
            const offeredCourses: Record<string, Set<string>> = {};
            for (const course of courses) {
                if (isCourseOffered(course.department, course.courseNumber, offeredCourseSet)) {
                    if (!Object.hasOwn(offeredCourses, course.department)) {
                        offeredCourses[course.department] = new Set();
                    }
                    offeredCourses[course.department].add(course.courseNumber);
                }
            }
            return offeredCourses;
        }),
});

export default searchRouter;

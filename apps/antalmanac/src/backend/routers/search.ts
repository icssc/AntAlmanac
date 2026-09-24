import { readFile } from 'fs/promises';
import { join } from 'node:path';

import { procedure, router } from '$backend/trpc';
// eslint-disable-next-line import/no-unresolved
import _searchData from '$generated/searchData.json';
import {
    type CourseSearchResult,
    type GESearchResult,
    type SearchResult,
    type SectionSearchResult,
    WebsocSearchInputSchema,
} from '@packages/antalmanac-types';
import * as fuzzysort from 'fuzzysort';
import { z } from 'zod';

import { COURSE_RENAMES } from '../../lib/renames/renames';

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

const isCourseOffered = (course: CourseSearchResult, offeredCourseSet: Set<string>): boolean => {
    return offeredCourseSet.has(`${course.metadata.department}-${course.metadata.number}`);
};

const sortByOffered = (a: CourseSearchResult, b: CourseSearchResult) => {
    if (a.isOffered === b.isOffered) return 0;
    return a.isOffered ? -1 : 1;
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
                                      isOffered: isCourseOffered(course.obj, offeredCourseSet),
                                  },
                              };
                          })
                          .sort((a, b) => sortByOffered(a.obj, b.obj))
                          .slice(0, MAX_AUTOCOMPLETE_RESULTS - matchedDepts.length - matchedSections.length);

            const newRenamedCourseKeys = matchedCourses
                .map((course) =>
                    COURSE_RENAMES.find(
                        (renames) =>
                            renames.previously.courseNumber === course.obj.metadata.number &&
                            renames.previously.deptCode === course.obj.metadata.department
                    )
                )
                .filter((rename) => !!rename)
                .map((rename) => rename.current)
                .filter(
                    (rename) =>
                        !matchedCourses.some(
                            (course) =>
                                course.obj.metadata.number === rename.courseNumber &&
                                course.obj.metadata.department === rename.deptCode
                        )
                );

            const newRenamedCourses = newRenamedCourseKeys
                .map((rename) =>
                    searchData.courses.find(
                        (course) =>
                            course.metadata.number === rename.courseNumber &&
                            course.metadata.department === rename.deptCode
                    )
                )
                .filter((course) => !!course)
                .map((course) => ({
                    ...course,
                    isOffered: isCourseOffered(course, offeredCourseSet),
                }));

            const matchedAndRenamedCourses = matchedCourses
                .map((x) => x.obj)
                .concat(newRenamedCourses)
                .sort((a, b) => sortByOffered(a, b));

            return Object.fromEntries([
                ...matchedSections.map((x) => [x.sectionCode, x]),
                ...matchedDepts.map((x) => [x.obj.id, x.obj]),
                ...matchedAndRenamedCourses.map((x) => [x.id, x]),
            ]);
        }),
});

export default searchRouter;

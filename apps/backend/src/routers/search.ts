import { readFile } from 'fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import type { CourseSearchResult, GESearchResult, SearchResult, SectionSearchResult } from '@packages/antalmanac-types';
import uFuzzy from '@leeoniya/ufuzzy';
import * as fuzzysort from 'fuzzysort';
import { procedure, router } from '../trpc';
import { backendEnvSchema } from '../env';
import * as searchData from '$generated/searchData';
import {
    classifyQuery,
    parseCourseCodeQuery,
    normalizeText,
    normalizeDepartment,
    normalizeCourseCode,
} from '../lib/helpers';

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

const toGESearchResult = (key: GECategoryKey): [string, SearchResult] => [
    key.toUpperCase().replace('GE', 'GE-'),
    geCategories[key],
];

const toMutable = <T>(arr: readonly T[]): T[] => arr as T[];

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

            // Check for GE category matches first
            const u = new uFuzzy();
            const matchedGEs = u.search(toMutable(geCategoryKeys), query)[0]?.map((i) => geCategoryKeys[i]) ?? [];
            if (matchedGEs.length) return Object.fromEntries(matchedGEs.map(toGESearchResult));

            // Before all the queries used the same fuzzy search but by classifying the query we can use the best search strategy for the query.
            // Classify the query to determine search strategy
            const queryType = classifyQuery(query);
            const normalizedQuery = normalizeText(query);

            type FuzzysortResult<T> = Array<{ obj: T; score: number }>;
            let matchedCourses: FuzzysortResult<CourseSearchResult & { id: string }> = [];
            let matchedDepts: FuzzysortResult<{ id: string; name: string; alias?: string }> = [];

            if (queryType === 'department') {
                // Case A: Department-only query (e.g., "inf")
                // Return only courses from that department
                const normDept = normalizeDepartment(query);
                const departmentCourses = searchData.courses.filter((course) => {
                    const courseNormDept = course.normDept || normalizeDepartment(course.metadata.department);
                    const courseAlias = course.alias ? normalizeDepartment(course.alias) : null;
                    // Match if department code or alias matches
                    return (
                        courseNormDept === normDept ||
                        courseNormDept.startsWith(normDept) ||
                        courseAlias === normDept ||
                        (courseAlias && courseAlias.startsWith(normDept))
                    );
                });

                // Sort by course number for consistent ordering
                departmentCourses.sort((a, b) => {
                    const numA = parseInt(a.metadata.number) || 0;
                    const numB = parseInt(b.metadata.number) || 0;
                    return numA - numB;
                });

                matchedCourses = departmentCourses.slice(0, MAX_AUTOCOMPLETE_RESULTS - matchedSections.length).map(
                    (course) =>
                        ({
                            obj: course,
                            score: 0, // Exact match, highest priority
                        }) as { obj: CourseSearchResult & { id: string }; score: number }
                );

                // Also search for matching departments
                if (matchedSections.length + matchedCourses.length < MAX_AUTOCOMPLETE_RESULTS) {
                    const deptResults = fuzzysort.go(query, searchData.departments, {
                        keys: ['id', 'alias'],
                        limit: MAX_AUTOCOMPLETE_RESULTS - matchedSections.length - matchedCourses.length,
                    });
                    matchedDepts = Array.from(deptResults);
                }
            } else if (queryType === 'course-code') {
                // Case B: Course code query (e.g., "inf 131", "inf131")
                const parsed = parseCourseCodeQuery(query);
                if (parsed) {
                    const targetNormCode = normalizeCourseCode(parsed.department, parsed.number);
                    const exactMatches: (CourseSearchResult & { id: string })[] = [];
                    const prefixMatches: (CourseSearchResult & { id: string })[] = [];

                    for (const course of searchData.courses) {
                        const courseNormCode = course.normCourseCode || normalizeCourseCode(course.metadata.department, course.metadata.number);
                        // Also check alias-based course code (e.g., "inf 131" should match "IN4MATX 131" if alias is "INF")
                        const courseAliasCode = course.alias
                            ? normalizeCourseCode(course.alias, course.metadata.number)
                            : null;

                        if (courseNormCode === targetNormCode || courseAliasCode === targetNormCode) {
                            exactMatches.push(course);
                        } else if (courseNormCode.startsWith(targetNormCode) || (courseAliasCode && courseAliasCode.startsWith(targetNormCode))) {
                            prefixMatches.push(course);
                        }
                    }

                    // Sort exact matches by course number, then prefix matches
                    exactMatches.sort((a, b) => {
                        const numA = parseInt(a.metadata.number) || 0;
                        const numB = parseInt(b.metadata.number) || 0;
                        return numA - numB;
                    });
                    prefixMatches.sort((a, b) => {
                        const numA = parseInt(a.metadata.number) || 0;
                        const numB = parseInt(b.metadata.number) || 0;
                        return numA - numB;
                    });

                    const allMatches = [...exactMatches, ...prefixMatches].slice(
                        0,
                        MAX_AUTOCOMPLETE_RESULTS - matchedSections.length
                    );
                    matchedCourses = allMatches.map(
                        (course) =>
                            ({
                                obj: course,
                                score: exactMatches.includes(course) ? 0 : 1,
                            }) as { obj: CourseSearchResult & { id: string }; score: number }
                    );
                }
            } else {
                // Case C: Generic query (e.g., "sociology", "medical sociology")
                // Use fuzzy search with priority ordering
                const remainingLimit = MAX_AUTOCOMPLETE_RESULTS - matchedSections.length;

                // First, try to match departments
                if (remainingLimit > 0) {
                    const deptResults = fuzzysort.go(query, searchData.departments, {
                        keys: ['id', 'alias'],
                        limit: Math.min(2, remainingLimit), // Limit departments to 2 for generic queries
                    });
                    matchedDepts = Array.from(deptResults);
                }

                // Then search courses with priority: course code > department > title > blob
                const courseLimit = remainingLimit - matchedDepts.length;
                if (courseLimit > 0) {
                    // Search with multiple key priorities - fuzzysort will try keys in order
                    const allCourseResults = fuzzysort.go(query, searchData.courses, {
                        keys: ['normCourseCode', 'normDept', 'normTitle', 'normBlob', 'name'],
                        threshold: -10000, // Allow more matches but still filter very poor ones
                        limit: courseLimit * 2, // Get more results to filter
                    });

                    // Filter and prioritize: exact/strong matches on course code and department first
                    const prioritized: FuzzysortResult<CourseSearchResult & { id: string }> = [];
                    const others: FuzzysortResult<CourseSearchResult & { id: string }> = [];

                    for (const result of allCourseResults) {
                        const course = result.obj;
                        const normCourseCode = course.normCourseCode || normalizeCourseCode(course.metadata.department, course.metadata.number);
                        const normDept = course.normDept || normalizeDepartment(course.metadata.department);
                        
                        // Check if query matches course code or department strongly
                        if (
                            normCourseCode.includes(normalizedQuery) ||
                            normDept.includes(normalizedQuery) ||
                            normalizedQuery.includes(normDept)
                        ) {
                            prioritized.push(result);
                        } else {
                            others.push(result);
                        }
                    }

                    // Combine prioritized first, then others, up to limit
                    matchedCourses = [...prioritized, ...others].slice(0, courseLimit);
                }
            }

            return Object.fromEntries([
                ...matchedSections.map((x) => [x.sectionCode, x]),
                ...matchedDepts.map((x) => [x.obj.id, x.obj]),
                ...matchedCourses.map((x) => [x.obj.id, x.obj]),
            ]);
        }),
});

export default searchRouter;

import { readFile } from 'fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import type { GESearchResult, SearchResult, SectionSearchResult } from '@packages/antalmanac-types';
import uFuzzy from '@leeoniya/ufuzzy';
import * as fuzzysort from 'fuzzysort';
import { env } from 'src/env';
import { procedure, router } from '../trpc';
import * as searchData from '$generated/searchData';

const { STAGE } = env;

const MAX_AUTOCOMPLETE_RESULTS = 12;

const isLambda = STAGE !== 'local';

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

            return Object.fromEntries([
                ...matchedSections.map((x) => [x.sectionCode, x]),
                ...matchedDepts.map((x) => [x.obj.id, x.obj]),
                ...matchedCourses.map((x) => [x.obj.id, x.obj]),
            ]);
        }),
});

export default searchRouter;

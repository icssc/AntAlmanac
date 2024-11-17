import { z } from 'zod';
import type { GESearchResult, SearchResponse, SearchResult } from '@packages/antalmanac-types';
import { procedure, router } from '../trpc';
import { DepartmentAliasKey, departmentAliasKeys, DepartmentKey, departmentKeys, toDepartment } from '../searchData';
import uFuzzy from '@leeoniya/ufuzzy';

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

const queryFuzzySaas = async (query: string, take: number): Promise<[string, SearchResult][]> =>
    take < 1
        ? []
        : await fetch(
              `https://anteaterapi.com/v2/rest/search?query=${encodeURIComponent(
                  query
              )}&resultType=course&take=${take}`,
              {
                  headers: {
                      ...(process.env.ANTEATER_API_KEY && {
                          Authorization: `Bearer ${process.env.ANTEATER_API_KEY}`,
                      }),
                  },
              }
          )
              .then((r) => r.json())
              .then((r: SearchResponse) =>
                  r.data.results
                      .filter((x) => x.type === 'course')
                      .map((x) => x.result)
                      .map((x) => [
                          x.id,
                          {
                              type: 'COURSE' as const,
                              name: x.title,
                              metadata: { department: x.department, number: x.courseNumber },
                          },
                      ])
              );

const toMutable = <T>(arr: readonly T[]): T[] => arr as T[];

const searchRouter = router({
    doSearch: procedure
        .input(z.object({ query: z.string() }))
        .query(async ({ input }): Promise<Record<string, SearchResult>> => {
            const { query } = input;
            const u = new uFuzzy();
            const matchedGEs = u.search(toMutable(geCategoryKeys), query)[0]?.map((i) => geCategoryKeys[i]) ?? [];
            if (matchedGEs.length) return Object.fromEntries(matchedGEs.map(toGESearchResult));
            // TODO implement department searching
            const matchedDeptAliases = (
                u.search(toMutable(departmentAliasKeys), query)[0]?.map((i) => departmentAliasKeys[i]) ?? []
            ).slice(0, 10);
            const matchedDepts =
                matchedDeptAliases.length === 10
                    ? []
                    : (u.search(toMutable(departmentKeys), query)[0]?.map((i) => departmentKeys[i]) ?? []).slice(
                          0,
                          10 - matchedDeptAliases.length
                      );
            return Object.fromEntries(
                (matchedDeptAliases as Array<DepartmentKey | DepartmentAliasKey>)
                    .concat(matchedDepts as Array<DepartmentKey | DepartmentAliasKey>)
                    .map(toDepartment)
                    .concat(await queryFuzzySaas(input.query, 10 - matchedDepts.length))
            );
        }),
});

export default searchRouter;

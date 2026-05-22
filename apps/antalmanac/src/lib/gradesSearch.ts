import { ANY_GE } from '$components/RightPane/CoursePane/SearchForm/constants';
import type { CourseSearchParams } from '$components/RightPane/RightPaneStore';
import { trpc, trpcReact } from '$lib/api/trpc';
import type { AggregateGrades, AggregateGradesByOffering } from '@packages/anteater-api/types';
import type { GE } from '@packages/anteater-api/types';
import { useMemo } from 'react';

export const SEARCH_RESULTS_QUERY_KEY = 'searchResults' as const;

type TrpcUtils = ReturnType<typeof trpcReact.useUtils>;
type GradeDistribution = NonNullable<AggregateGrades>['gradeDistribution'];
type GradeOfferingRow = AggregateGradesByOffering[number];

export type GradesPrefetchParams = {
    department?: string;
    ge?: GE;
};

function gradesScopeKey(params: GradesPrefetchParams): string {
    return `${params.department ?? ''}${params.ge ?? ''}`;
}

function gradesGeForManualSearch(ge: string): GE | undefined {
    if (ge === ANY_GE || ge.includes(',')) {
        return undefined;
    }
    return ge as GE;
}

export function getGradesPrefetchParams(searchData: CourseSearchParams): GradesPrefetchParams | null {
    const department = searchData.deptValue !== 'ALL' ? searchData.deptValue : undefined;
    const ge = gradesGeForManualSearch(searchData.ge);
    if (!department && !ge) {
        return null;
    }
    return { department, ge };
}

function formatGpa(averageGPA: number | null | undefined): string {
    if (averageGPA == null) {
        return '';
    }
    return averageGPA.toFixed(2);
}

function offeringToAggregateGrades(offering: GradeOfferingRow): AggregateGrades {
    return {
        gradeDistribution: {
            averageGPA: offering.averageGPA,
            gradeACount: offering.gradeACount,
            gradeBCount: offering.gradeBCount,
            gradeCCount: offering.gradeCCount,
            gradeDCount: offering.gradeDCount,
            gradeFCount: offering.gradeFCount,
            gradeNPCount: offering.gradeNPCount,
            gradePCount: offering.gradePCount,
            gradeWCount: offering.gradeWCount,
        },
    };
}

function hydrateGradesCache(utils: TrpcUtils, offerings: AggregateGradesByOffering): void {
    if (!offerings?.length) {
        return;
    }

    for (const offering of offerings) {
        utils.grades.aggregateGrades.setData(
            {
                department: offering.department,
                courseNumber: offering.courseNumber,
                instructor: offering.instructor ?? '',
            },
            offeringToAggregateGrades(offering)
        );
    }
}

/** One bulk AAPI call per unique dept/GE scope; hydrates React Query for GpaCell and GradesPopover. */
export async function prefetchSearchGrades(utils: TrpcUtils, paramsList: GradesPrefetchParams[]): Promise<void> {
    const seen = new Set<string>();

    for (const params of paramsList) {
        const key = gradesScopeKey(params);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);

        const offerings = await trpc.grades.aggregateByOffering.mutate(params);
        hydrateGradesCache(utils, offerings);
    }
}

export function lookupGradeDistribution(
    utils: TrpcUtils,
    department: string,
    courseNumber: string,
    instructor: string
): GradeDistribution | undefined {
    return utils.grades.aggregateGrades.getData({ department, courseNumber, instructor })?.gradeDistribution;
}

function lookupFirstInstructorGpa(
    utils: TrpcUtils,
    department: string,
    courseNumber: string,
    namedInstructors: string[]
): { instructor: string; gpa: string } | null {
    for (const instructor of namedInstructors) {
        const distribution = lookupGradeDistribution(utils, department, courseNumber, instructor);
        if (distribution?.averageGPA != null) {
            return { instructor, gpa: formatGpa(distribution.averageGPA) };
        }
    }
    return null;
}

/** Search path: read hydrated cache. Added path: aggregateGrades per instructor until first GPA. */
export function useSectionGpa(deptCode: string, courseNumber: string, instructors: string[]) {
    const utils = trpcReact.useUtils();
    const namedInstructors = useMemo(() => instructors.filter((instructor) => instructor !== 'STAFF'), [instructors]);

    const cachedMatch = useMemo(
        () => lookupFirstInstructorGpa(utils, deptCode, courseNumber, namedInstructors),
        [courseNumber, deptCode, namedInstructors, utils]
    );

    const instructorResults = trpcReact.useQueries((t) =>
        namedInstructors.map((instructor) =>
            t.grades.aggregateGrades(
                { department: deptCode, courseNumber, instructor },
                {
                    enabled: cachedMatch === null,
                    select: (data) => data?.gradeDistribution ?? null,
                }
            )
        )
    );

    const fetchedMatch = useMemo(() => {
        const idx = instructorResults.findIndex((r) => r.data?.averageGPA != null);
        if (idx < 0) {
            return null;
        }
        return {
            instructor: namedInstructors[idx],
            gpa: formatGpa(instructorResults[idx].data?.averageGPA),
        };
    }, [instructorResults, namedInstructors]);

    const loading = cachedMatch === null && instructorResults.some((r) => r.isLoading);

    return {
        gpa: cachedMatch?.gpa ?? fetchedMatch?.gpa ?? '',
        instructor: cachedMatch?.instructor ?? fetchedMatch?.instructor ?? namedInstructors[0] ?? '',
        loading,
    };
}

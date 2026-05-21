import { ANY_GE } from '$components/RightPane/CoursePane/SearchForm/constants';
import type { CourseSearchParams } from '$components/RightPane/RightPaneStore';
import { trpc, trpcReact } from '$lib/api/trpc';
import type { AggregateGrades, AggregateGradesByOffering } from '@packages/anteater-api/types';
import type { GE } from '@packages/anteater-api/types';

export const SEARCH_RESULTS_QUERY_KEY = 'searchResults' as const;

type TrpcUtils = ReturnType<typeof trpcReact.useUtils>;

type GradeOfferingRow = AggregateGradesByOffering[number];

export type GradesPrefetchParams = {
    department?: string;
    ge?: GE;
};

function gradesScopeKey(params: GradesPrefetchParams): string {
    return `${params.department ?? ''}${params.ge ?? ''}`;
}

export function gradesGeForManualSearch(ge: string): GE | undefined {
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

export function hydrateGradesCache(utils: TrpcUtils, offerings: AggregateGradesByOffering): void {
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

export async function prefetchGradesForSearch(utils: TrpcUtils, paramsList: GradesPrefetchParams[]): Promise<void> {
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

import { ANY_GE } from '$components/RightPane/CoursePane/SearchForm/constants';
import type { CourseSearchParams } from '$components/RightPane/RightPaneStore';
import { trpc, trpcReact } from '$lib/api/trpc';
import type { AggregateGrades, AggregateGradesByOffering } from '@packages/anteater-api/types';
import type { GE } from '@packages/anteater-api/types';

type TrpcUtils = ReturnType<typeof trpcReact.useUtils>;
type GradeOfferingRow = AggregateGradesByOffering[number];
type GradeDistribution = NonNullable<AggregateGrades>['gradeDistribution'];

/** True after bulk prefetch hydrated any aggregateGrades entries for this department. */
export function isDepartmentBulkLoaded(utils: TrpcUtils, department: string): boolean {
    return (
        utils.queryClient.getQueriesData({
            predicate: (query) => {
                const procedureKey = query.queryKey[0];
                const options = query.queryKey[1] as { type?: string; input?: { department?: string } } | undefined;
                return (
                    Array.isArray(procedureKey) &&
                    procedureKey[0] === 'grades' &&
                    procedureKey[1] === 'aggregateGrades' &&
                    options?.type === 'query' &&
                    options?.input?.department === department
                );
            },
        }).length > 0
    );
}

export function getCachedGradeDistribution(
    utils: TrpcUtils,
    department: string,
    courseNumber: string,
    instructor: string
): GradeDistribution | undefined {
    return utils.grades.aggregateGrades.getData({ department, courseNumber, instructor })?.gradeDistribution;
}

function getPrefetchScope(searchData: CourseSearchParams): { department?: string; ge?: GE } | null {
    const department = searchData.deptValue !== 'ALL' ? searchData.deptValue : undefined;
    const ge = searchData.ge !== ANY_GE && !searchData.ge.includes(',') ? (searchData.ge as GE) : undefined;
    if (!department && !ge) {
        return null;
    }
    return { department, ge };
}

function toAggregateGrades(offering: GradeOfferingRow): AggregateGrades {
    return {
        sectionList: [],
        gradeDistribution: { ...offering },
    };
}

function hydrateGradesCache(utils: TrpcUtils, offerings: AggregateGradesByOffering): void {
    for (const offering of offerings) {
        utils.grades.aggregateGrades.setData(
            {
                department: offering.department,
                courseNumber: offering.courseNumber,
                instructor: offering.instructor ?? '',
            },
            toAggregateGrades(offering)
        );
    }
}

/**
 * Bulk-fetch dept/GE grades and hydrate aggregateGrades cache before GpaCell mounts.
 *
 * TODO (@KevinWu098): Make this cleaner
 */
export async function prefetchSearchGrades(utils: TrpcUtils, searchDataList: CourseSearchParams[]): Promise<void> {
    const scopes = new Map<string, { department?: string; ge?: GE }>();

    for (const searchData of searchDataList) {
        const scope = getPrefetchScope(searchData);
        if (!scope) {
            continue;
        }

        const key = `${scope.department ?? ''}::${scope.ge ?? ''}`;
        scopes.set(key, scope);
    }

    const offeringsByScope = await Promise.all(
        [...scopes.values()].map((scope) => trpc.grades.aggregateByOffering.mutate(scope))
    );

    for (const offerings of offeringsByScope) {
        hydrateGradesCache(utils, offerings);
    }
}

import type { AggregateGrades } from '@packages/anteater-api/types';

import { COURSE_RENAMES } from './courseRenames';

/** A bare department + course-number pair as used by AnteaterAPI query params. */
export interface CourseIdentifier {
    department: string;
    courseNumber: string;
}

/** Formats a `CourseIdentifier` into the canonical AnteaterAPI course ID string. */
export function toCourseId({ department, courseNumber }: CourseIdentifier): string {
    return `${department} ${courseNumber}`;
}

/** Splits an AnteaterAPI course ID string back into its constituent parts. */
export function fromCourseId(id: string): CourseIdentifier {
    const spaceIdx = id.indexOf(' ');
    return {
        department: id.slice(0, spaceIdx),
        courseNumber: id.slice(spaceIdx + 1),
    };
}

/**
 * Walks the rename chain backwards from `courseId` and returns all predecessor
 * IDs in order from most recent to oldest, **excluding** `courseId` itself.
 *
 * Example — chain A (2020) → B (2022) → C (2025):
 *   getPredecessorIds('C') → ['B', 'A']
 *   getPredecessorIds('B') → ['A']
 *   getPredecessorIds('A') → []
 *
 * The walk is bounded by the length of `COURSE_RENAMES`, so cycles (which
 * should never occur in practice) cannot cause an infinite loop.
 */
export function getPredecessorIds(courseId: string): string[] {
    const predecessors: string[] = [];
    const visited = new Set<string>();
    let current = courseId;

    while (COURSE_RENAMES[current] && !visited.has(current)) {
        visited.add(current);
        const { previously } = COURSE_RENAMES[current];
        predecessors.push(previously);
        current = previously;
    }

    return predecessors;
}

/**
 * Returns all `CourseIdentifier`s that must be queried to obtain the full
 * historical record for `ci`, starting with `ci` itself (current name) and
 * followed by each predecessor from newest to oldest.
 *
 * When the course has not been renamed, the returned array contains only `ci`.
 */
export function getAllCourseIdentifiers(ci: CourseIdentifier): CourseIdentifier[] {
    const id = toCourseId(ci);
    return [id, ...getPredecessorIds(id)].map(fromCourseId);
}

/**
 * Merges an array of `AggregateGrades` results (one per course ID queried)
 * into a single combined result.
 *
 * Grade counts in `gradeDistribution` are summed across all inputs.
 * `averageGPA` is recalculated as a weighted mean of each input's GPA,
 * weighted by its own student count.  Inputs where `averageGPA` is null/
 * undefined (no GPA data) contribute only their count totals.
 *
 * Returns `null` when every input is null/undefined (no data at all).
 */
export function mergeAggregateGrades(results: (AggregateGrades | null | undefined)[]): AggregateGrades | null {
    const defined = results.filter((r): r is NonNullable<AggregateGrades> => r != null);
    if (defined.length === 0) return null;
    if (defined.length === 1) return defined[0];

    type GradeDistribution = NonNullable<AggregateGrades>['gradeDistribution'];
    type GradeCountKey = Exclude<keyof GradeDistribution, 'averageGPA'>;

    // Collect all grade-count keys from the first non-null result (they are
    // uniform across all AnteaterAPI responses).
    const countKeys = (Object.keys(defined[0].gradeDistribution) as Array<keyof GradeDistribution>).filter(
        (k): k is GradeCountKey => k !== 'averageGPA'
    );

    // Sum each grade bucket across all results.
    const mergedCounts = Object.fromEntries(
        countKeys.map((key) => [key, defined.reduce((sum, r) => sum + ((r.gradeDistribution[key] as number) ?? 0), 0)])
    ) as Omit<GradeDistribution, 'averageGPA'>;

    // Weighted-average GPA across results that actually have GPA data.
    const totalStudents = countKeys.reduce((sum, k) => sum + (mergedCounts[k] as number), 0);

    let weightedGpaSum = 0;
    let weightedGpaCount = 0;
    for (const r of defined) {
        const gpa = r.gradeDistribution.averageGPA;
        if (gpa == null) continue;
        const count = countKeys.reduce((s, k) => s + ((r.gradeDistribution[k as GradeCountKey] as number) ?? 0), 0);
        weightedGpaSum += gpa * count;
        weightedGpaCount += count;
    }

    const averageGPA = weightedGpaCount > 0 ? weightedGpaSum / weightedGpaCount : null;

    return {
        ...defined[0],
        gradeDistribution: {
            ...mergedCounts,
            averageGPA,
        },
        // `numStudents` (if present) should reflect the merged total.
        ...(totalStudents > 0 ? { numStudents: totalStudents } : {}),
    } as NonNullable<AggregateGrades>;
}

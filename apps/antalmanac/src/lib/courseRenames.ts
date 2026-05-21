import type { AggregateGrades } from '@packages/anteater-api/types';

/**
 * Metadata for a single course rename event.
 *
 * `effectiveYear` is the fall-start year of the academic year in which the
 * course was first offered under its new name (e.g. 2024 → Fall 2024–25).
 * Data before `effectiveYear` in AnteaterAPI is recorded under `previously`;
 * data from `effectiveYear` onward is under the new department/courseNumber.
 * The two sets are disjoint — fetching both is purely additive.
 *
 * Chains (A → B → C) are represented as consecutive entries where each step's
 * `previously` points to the immediately preceding department/courseNumber.
 */
interface CourseRenameEntry {
    previously: { department: string; courseNumber: string };
    effectiveYear: number;
}

/**
 * Nested map: department → courseNumber → rename metadata.
 *
 * To add a rename:
 *   1. Add (or extend) the department key.
 *   2. Add the *new* courseNumber as the inner key.
 *   3. Set `previously` to the old department/courseNumber.
 *   4. Set `effectiveYear` to the fall-start year the new name appeared.
 *
 * Example chain A(dept, num) → B → C:
 *   B_dept: { B_num: { previously: A, effectiveYear: year1 } }
 *   C_dept: { C_num: { previously: B, effectiveYear: year2 } }
 */
const COURSE_RENAMES: Record<string, Record<string, CourseRenameEntry>> = {
    // INF 43 → SWE 43 (Fall 2024)
    SWE: {
        '43': { previously: { department: 'INF', courseNumber: '43' }, effectiveYear: 2024 },
    },
    // ICS 32A → ICS H32 (Fall 2024)
    ICS: {
        H32: { previously: { department: 'ICS', courseNumber: '32A' }, effectiveYear: 2024 },
    },
};

/**
 * Returns every { department, courseNumber } pair that must be queried to
 * obtain the full historical record for a course, starting with the current
 * name and followed by each predecessor from newest to oldest.
 *
 * When the course has no rename history, the returned array contains only the
 * input values and no extra queries are needed.
 *
 * The loop depth is bounded by the total number of entries in `COURSE_RENAMES`
 * so cycles (which should never occur in practice) cannot cause an infinite loop.
 */
export function getAllCourseIdentifiers(
    department: string,
    courseNumber: string
): Array<{ department: string; courseNumber: string }> {
    const identifiers: Array<{ department: string; courseNumber: string }> = [{ department, courseNumber }];

    const maxDepth = Object.values(COURSE_RENAMES).reduce((sum, dept) => sum + Object.keys(dept).length, 0);
    let current = { department, courseNumber };

    for (let i = 0; i < maxDepth; i++) {
        const entry = COURSE_RENAMES[current.department]?.[current.courseNumber];
        if (!entry) break;
        identifiers.push(entry.previously);
        current = entry.previously;
    }

    return identifiers;
}

/**
 * Merges an array of `AggregateGrades` results (one per course ID queried)
 * into a single combined result.
 *
 * Grade counts in `gradeDistribution` are summed across all inputs.
 * `averageGPA` is recalculated as a weighted mean, weighted by each input's
 * student count.  Inputs with a null `averageGPA` contribute only their counts.
 *
 * Returns `null` when every input is null/undefined (no data at all).
 */
export function mergeAggregateGrades(results: (AggregateGrades | null | undefined)[]): AggregateGrades | null {
    const defined = results.filter((r): r is NonNullable<AggregateGrades> => r != null);
    if (defined.length === 0) return null;
    if (defined.length === 1) return defined[0];

    type GradeDistribution = NonNullable<AggregateGrades>['gradeDistribution'];
    type GradeCountKey = Exclude<keyof GradeDistribution, 'averageGPA'>;

    const countKeys = (Object.keys(defined[0].gradeDistribution) as Array<keyof GradeDistribution>).filter(
        (k): k is GradeCountKey => k !== 'averageGPA'
    );

    const mergedCounts = Object.fromEntries(
        countKeys.map((key) => [key, defined.reduce((sum, r) => sum + ((r.gradeDistribution[key] as number) ?? 0), 0)])
    ) as Omit<GradeDistribution, 'averageGPA'>;

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

    const totalStudents = countKeys.reduce((sum, k) => sum + (mergedCounts[k] as number), 0);

    return {
        ...defined[0],
        gradeDistribution: { ...mergedCounts, averageGPA },
        ...(totalStudents > 0 ? { numStudents: totalStudents } : {}),
    } as NonNullable<AggregateGrades>;
}

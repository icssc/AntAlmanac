import type { AggregateGrades } from '@packages/anteater-api/types';

interface CourseId {
    department: string;
    courseNumber: string;
}

/**
 * Each entry maps a course's current identity to the identity it held
 * immediately before the rename, plus the fall-start year the new name
 * first appeared.
 *
 * Data before `effectiveYear` in AnteaterAPI lives under `previously`;
 * data from `effectiveYear` onward lives under the current department +
 * courseNumber.  The two sets are disjoint — fetching both is additive.
 *
 * Chains (A → B → C) use two entries:
 *   { department: B_dept, courseNumber: B_num, previously: A, effectiveYear: year1 }
 *   { department: C_dept, courseNumber: C_num, previously: B, effectiveYear: year2 }
 */
interface CourseRename extends CourseId {
    previously: CourseId;
    effectiveYear: number;
}

/**
 * To add a rename, append one object: the new department/courseNumber, the
 * old department/courseNumber as `previously`, and the fall-start year.
 */
const COURSE_RENAMES: CourseRename[] = [
    // INF 43 → SWE 43 (Fall 2024)
    {
        department: 'SWE',
        courseNumber: '43',
        previously: { department: 'INF', courseNumber: '43' },
        effectiveYear: 2024,
    },
    // ICS 32A → ICS H32 (Fall 2024)
    {
        department: 'ICS',
        courseNumber: 'H32',
        previously: { department: 'ICS', courseNumber: '32A' },
        effectiveYear: 2024,
    },
];

/**
 * Returns every { department, courseNumber } pair that must be queried to
 * obtain the full historical record for a course, starting with the current
 * name and followed by each predecessor from newest to oldest.
 *
 * When the course has no rename history, the returned array contains only the
 * input values and no extra queries are needed.
 */
export function getAllCourseIdentifiers(department: string, courseNumber: string): CourseId[] {
    const identifiers: CourseId[] = [{ department, courseNumber }];
    let current: CourseId = { department, courseNumber };

    // Bound iterations by list length to guard against accidental cycles.
    for (let i = 0; i < COURSE_RENAMES.length; i++) {
        const entry = COURSE_RENAMES.find(
            (r) => r.department === current.department && r.courseNumber === current.courseNumber
        );
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

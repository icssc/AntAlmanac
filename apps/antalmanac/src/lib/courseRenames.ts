import type { AggregateGrades } from '@packages/anteater-api/types';

interface CourseId {
    department: string;
    courseNumber: string;
}

// `effectiveYear` is the fall-start year the new name first appeared.
// Chains (A → B → C) use two consecutive entries.
interface CourseRename extends CourseId {
    previously: CourseId;
    effectiveYear: number;
}

const COURSE_RENAMES: CourseRename[] = [
    {
        department: 'SWE',
        courseNumber: '43',
        previously: { department: 'INF', courseNumber: '43' },
        effectiveYear: 2026,
    },
    {
        department: 'ICS',
        courseNumber: 'H32',
        previously: { department: 'ICS', courseNumber: '32A' },
        effectiveYear: 2024,
    },
];

/** Returns the current course plus all predecessors, newest-first, for fan-out queries. */
export function getAllCourseIdentifiers(department: string, courseNumber: string): CourseId[] {
    const identifiers: CourseId[] = [{ department, courseNumber }];
    let current: CourseId = { department, courseNumber };

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

/** Sums grade counts across results and recalculates averageGPA as a weighted mean. */
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

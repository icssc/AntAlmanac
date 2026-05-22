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
        previously: { department: 'IN4MATX', courseNumber: '43' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '113',
        previously: { department: 'IN4MATX', courseNumber: '113' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '115',
        previously: { department: 'IN4MATX', courseNumber: '115' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '117',
        previously: { department: 'IN4MATX', courseNumber: '117' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '119',
        previously: { department: 'IN4MATX', courseNumber: '119' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '121',
        previously: { department: 'IN4MATX', courseNumber: '121' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '122',
        previously: { department: 'IN4MATX', courseNumber: '122' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '124',
        previously: { department: 'IN4MATX', courseNumber: '124' },
        effectiveYear: 2026,
    },
    {
        department: 'SWE',
        courseNumber: '141',
        previously: { department: 'IN4MATX', courseNumber: '141' },
        effectiveYear: 2026,
    },
    {
        department: 'I&C SCI',
        courseNumber: 'H32',
        previously: { department: 'I&C SCI', courseNumber: '32A' },
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

/**
 * Returns the given syllabi courseId (format: `deptCode.replaceAll(' ', '') + courseNumber`,
 * e.g. "SWE43") plus all predecessor courseIds in the same format, newest-first.
 */
export function getAllSyllabiCourseIds(courseId: string): string[] {
    const toSyllabiId = (ci: CourseId) => ci.department.replaceAll(' ', '') + ci.courseNumber;
    const ids: string[] = [courseId];
    let current = courseId;

    for (let i = 0; i < COURSE_RENAMES.length; i++) {
        const entry = COURSE_RENAMES.find((r) => toSyllabiId(r) === current);
        if (!entry) break;
        const prevId = toSyllabiId(entry.previously);
        ids.push(prevId);
        current = prevId;
    }

    return ids;
}

/**
 * Returns a formatted string describing all predecessor course names for display,
 * e.g. "Previously IN4MATX 43 (before 2026/27)" or null if no rename exists.
 * For chains, predecessors are listed newest-first, separated by commas.
 */
export function getPredecessorLabel(department: string, courseNumber: string): string | null {
    const parts: string[] = [];
    let current: CourseId = { department, courseNumber };

    for (let i = 0; i < COURSE_RENAMES.length; i++) {
        const entry = COURSE_RENAMES.find(
            (r) => r.department === current.department && r.courseNumber === current.courseNumber
        );
        if (!entry) break;
        const yr = entry.effectiveYear;
        const yearLabel = `${String(yr).slice(-2)}/${String(yr + 1).slice(-2)}`;
        parts.push(`${entry.previously.department} ${entry.previously.courseNumber} (before ${yearLabel})`);
        current = entry.previously;
    }

    return parts.length > 0 ? `Previously ${parts.join(', ')}` : null;
}

/** Sums grade counts across results and recalculates averageGPA as a weighted mean. */
export function mergeAggregateGrades(
    results: [NonNullable<AggregateGrades>, ...NonNullable<AggregateGrades>[]]
): NonNullable<AggregateGrades> {
    if (results.length === 1) return results[0];

    type GradeDistribution = NonNullable<AggregateGrades>['gradeDistribution'];
    type GradeCountKey = Exclude<keyof GradeDistribution, 'averageGPA'>;

    const countKeys = (Object.keys(results[0].gradeDistribution) as Array<keyof GradeDistribution>).filter(
        (k): k is GradeCountKey => k !== 'averageGPA'
    );

    const mergedCounts = Object.fromEntries(
        countKeys.map((key) => [key, results.reduce((sum, r) => sum + ((r.gradeDistribution[key] as number) ?? 0), 0)])
    ) as Omit<GradeDistribution, 'averageGPA'>;

    let weightedGpaSum = 0;
    let weightedGpaCount = 0;
    for (const r of results) {
        const gpa = r.gradeDistribution.averageGPA;
        if (gpa == null) continue;
        const count = countKeys.reduce((s, k) => s + ((r.gradeDistribution[k as GradeCountKey] as number) ?? 0), 0);
        weightedGpaSum += gpa * count;
        weightedGpaCount += count;
    }

    const averageGPA = weightedGpaCount > 0 ? weightedGpaSum / weightedGpaCount : null;
    const totalStudents = countKeys.reduce((sum, k) => sum + (mergedCounts[k] as number), 0);

    return {
        ...results[0],
        gradeDistribution: { ...mergedCounts, averageGPA },
        ...(totalStudents > 0 ? { numStudents: totalStudents } : {}),
    } as NonNullable<AggregateGrades>;
}

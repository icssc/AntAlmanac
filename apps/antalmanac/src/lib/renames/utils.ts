import { COURSE_RENAMES, type CourseId, type CourseRename } from '$lib/renames/renames';
import type { AggregateGrades } from '@packages/anteater-api/types';

function* iterateRenameChain(department: string, courseNumber: string): Generator<CourseRename> {
    let current: CourseId = { department, courseNumber };

    for (let i = 0; i < COURSE_RENAMES.length; i++) {
        const entry = COURSE_RENAMES.find(
            (r) => r.department === current.department && r.courseNumber === current.courseNumber
        );

        if (!entry) break;
        yield entry;
        current = entry.previously;
    }
}

export function getRenamedCoursesIdentifiers(department: string, courseNumber: string): CourseId[] {
    const identifiers: CourseId[] = [{ department, courseNumber }];

    for (const entry of iterateRenameChain(department, courseNumber)) {
        identifiers.push(entry.previously);
    }

    return identifiers;
}

export function getRenamedCoursesLabel(department: string, courseNumber: string): string | null {
    const parts: string[] = [];

    for (const entry of iterateRenameChain(department, courseNumber)) {
        const yr = entry.effectiveYear;
        const yearLabel = `${String(yr).slice(-2)}/${String(yr + 1).slice(-2)}`; // 2026 -> 26/27
        parts.push(`${entry.previously.department} ${entry.previously.courseNumber} (before ${yearLabel})`);
    }

    return parts.length > 0 ? `Previously ${parts.join(', ')}` : null;
}

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

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

    type GradeDistribution = NonNullable<NonNullable<AggregateGrades>['gradeDistribution']>;
    type GradeCountKey = Exclude<keyof GradeDistribution, 'averageGPA'>;

    const gradeCountValue = (distribution: GradeDistribution, key: GradeCountKey): number => {
        const value = distribution[key];
        return typeof value === 'number' ? value : 0;
    };

    const countKeys = Object.keys(results[0].gradeDistribution).filter(
        (key): key is GradeCountKey => key !== 'averageGPA'
    );

    const { averageGPA: _firstAverageGpa, ...mergedCounts } = results[0].gradeDistribution;
    for (const key of countKeys) {
        mergedCounts[key] = results.reduce((sum, r) => sum + gradeCountValue(r.gradeDistribution, key), 0);
    }

    let weightedGpaSum = 0;
    let weightedGpaCount = 0;
    for (const r of results) {
        const gpa = r.gradeDistribution.averageGPA;
        if (gpa == null) continue;
        const count = countKeys.reduce((sum, key) => sum + gradeCountValue(r.gradeDistribution, key), 0);
        weightedGpaSum += gpa * count;
        weightedGpaCount += count;
    }

    const averageGPA = weightedGpaCount > 0 ? weightedGpaSum / weightedGpaCount : null;

    return {
        sectionList: results.flatMap((r) => r.sectionList),
        gradeDistribution: { ...mergedCounts, averageGPA },
    };
}

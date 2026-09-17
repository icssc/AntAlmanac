import { COURSE_RENAMES, type CourseRename, type CourseRenameKey } from '$lib/renames/renames';
import type { AggregateGrades } from '@packages/anteater-api/types';
import { buildCourseId } from '@packages/anteater-api/utils';

function* iterateRenameChain(deptCode: string, courseNumber: string): Generator<CourseRename> {
    let current: CourseRenameKey = {
        deptCode,
        courseNumber,
        courseId: buildCourseId(deptCode, courseNumber),
    };

    for (let i = 0; i < COURSE_RENAMES.length; i++) {
        const entry = COURSE_RENAMES.find((r) => r.current.courseId === current.courseId);
        if (!entry) break;
        yield entry;
        current = entry.previously;
    }
}

export function getRenamedCoursesIdentifiers(deptCode: string, courseNumber: string): CourseRenameKey[] {
    const identifiers: CourseRenameKey[] = [
        { deptCode, courseNumber, courseId: buildCourseId(deptCode, courseNumber) },
    ];

    for (const entry of iterateRenameChain(deptCode, courseNumber)) {
        identifiers.push(entry.previously);
    }

    return identifiers;
}

export function getRenamedCoursesLabel(deptCode: string, courseNumber: string): string | null {
    const parts: string[] = [];

    for (const entry of iterateRenameChain(deptCode, courseNumber)) {
        const yr = entry.effectiveYear;
        const yearLabel = `${String(yr).slice(-2)}/${String(yr + 1).slice(-2)}`; // 2026 -> 26/27
        parts.push(`${entry.previously.deptCode} ${entry.previously.courseNumber} (before ${yearLabel})`);
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

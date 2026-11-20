import { COURSE_RENAMES, type CourseRename, type CourseRenameKey } from '$lib/renames/renames';
import type { CourseGradeDistribution } from '@packages/anteater-api/types';
import { buildCourseId } from '@packages/anteater-api/utils';

function* iterateRenameChain(deptCode: string, courseNumber: string): Generator<CourseRename> {
    let current: CourseRenameKey = {
        deptCode,
        courseNumber,
        courseId: buildCourseId(deptCode, courseNumber),
    };

    for (let i = 0; i < COURSE_RENAMES.length; i++) {
        const entry = COURSE_RENAMES.find((r) => r.current.courseId === current.courseId);
        if (!entry) {
            break;
        }
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
        parts.push(`${entry.previously.deptCode} ${entry.previously.courseNumber} (before ${entry.effectiveYear})`);
    }

    return parts.length > 0 ? `Previously ${parts.join(', ')}` : null;
}

export function getLatestRenamedCourseIdentifier(deptCode: string, courseNumber: string): CourseRenameKey {
    let current = {
        deptCode,
        courseNumber,
        courseId: buildCourseId(deptCode, courseNumber),
    };

    for (let i = 0; i < COURSE_RENAMES.length; i++) {
        const entry = COURSE_RENAMES.find((r) => r.previously.courseId === current.courseId);
        if (!entry) {
            break;
        }
        current = entry.current;
    }

    return current;
}

type GradeCountKey = Exclude<keyof CourseGradeDistribution, 'averageGPA' | 'department' | 'courseNumber'>;

export function isGradeDistributionKeyCount(key: string): key is GradeCountKey {
    return key !== 'averageGPA' && key !== 'department' && key !== 'courseNumber';
}

export function mergeAggregateGrades(
    results: [NonNullable<CourseGradeDistribution>, ...NonNullable<CourseGradeDistribution>[]]
): NonNullable<CourseGradeDistribution> {
    if (results.length === 1) return results[0];

    const countKeys = Object.keys(results[0]).filter(isGradeDistributionKeyCount);

    const { averageGPA: _firstAverageGpa, ...mergedCounts } = results[0];
    for (const key of countKeys) {
        mergedCounts[key] = results.reduce((sum, r) => sum + r[key], 0);
    }

    let weightedGpaSum = 0;
    let weightedGpaCount = 0;
    for (const r of results) {
        const gpa = r.averageGPA;
        if (gpa == null) continue;
        const count = countKeys.reduce((sum, key) => sum + r[key], 0);
        weightedGpaSum += gpa * count;
        weightedGpaCount += count;
    }

    const averageGPA = weightedGpaCount > 0 ? weightedGpaSum / weightedGpaCount : null;

    return {
        ...mergedCounts,
        averageGPA,
    };
}

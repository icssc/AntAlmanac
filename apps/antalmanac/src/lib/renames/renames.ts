import type { WebsocCourse } from '@packages/anteater-api/types';
import { buildCourseId } from '@packages/anteater-api/utils';

export type CourseRenameKey = Pick<WebsocCourse, 'deptCode' | 'courseNumber' | 'courseId'>;

// `effectiveYear` is the fall-start year the new name first appeared.
// Chains (A → B → C) use two consecutive entries.
export type CourseRename = {
    current: CourseRenameKey;
    previously: CourseRenameKey;
    effectiveYear: number;
};

const SWE_FROM_IN4MATX = ['43', '113', '115', '117', '119', '121', '122', '124', '141'] as const;

function toCourseKey(course: Pick<WebsocCourse, 'deptCode' | 'courseNumber'>): CourseRenameKey {
    return {
        ...course,
        courseId: buildCourseId(course.deptCode, course.courseNumber),
    };
}

function courseRename(
    current: Pick<WebsocCourse, 'deptCode' | 'courseNumber'>,
    previously: Pick<WebsocCourse, 'deptCode' | 'courseNumber'>,
    effectiveYear: number
): CourseRename {
    return {
        current: toCourseKey(current),
        previously: toCourseKey(previously),
        effectiveYear,
    };
}

export const COURSE_RENAMES: CourseRename[] = [
    ...SWE_FROM_IN4MATX.map((courseNumber) =>
        courseRename({ deptCode: 'SWE', courseNumber }, { deptCode: 'IN4MATX', courseNumber }, 2026)
    ),
    courseRename({ deptCode: 'I&C SCI', courseNumber: 'H32' }, { deptCode: 'I&C SCI', courseNumber: '32A' }, 2024),
];

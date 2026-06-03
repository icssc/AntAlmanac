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
    courseRename({ deptCode: 'SWE', courseNumber: '43' }, { deptCode: 'IN4MATX', courseNumber: '43' }, 2026),
    courseRename({ deptCode: 'SWE', courseNumber: '113' }, { deptCode: 'IN4MATX', courseNumber: '113' }, 2026),
    courseRename({ deptCode: 'SWE', courseNumber: '115' }, { deptCode: 'IN4MATX', courseNumber: '115' }, 2026),
    courseRename({ deptCode: 'SWE', courseNumber: '117' }, { deptCode: 'IN4MATX', courseNumber: '117' }, 2026),
    courseRename({ deptCode: 'SWE', courseNumber: '119' }, { deptCode: 'IN4MATX', courseNumber: '119' }, 2026),
    courseRename({ deptCode: 'SWE', courseNumber: '121' }, { deptCode: 'IN4MATX', courseNumber: '121' }, 2026),
    courseRename({ deptCode: 'SWE', courseNumber: '122' }, { deptCode: 'IN4MATX', courseNumber: '122' }, 2026),
    courseRename({ deptCode: 'SWE', courseNumber: '124' }, { deptCode: 'IN4MATX', courseNumber: '124' }, 2026),
    courseRename({ deptCode: 'SWE', courseNumber: '141' }, { deptCode: 'IN4MATX', courseNumber: '141' }, 2026),
    courseRename({ deptCode: 'I&C SCI', courseNumber: 'H32' }, { deptCode: 'I&C SCI', courseNumber: '32A' }, 2024),
];

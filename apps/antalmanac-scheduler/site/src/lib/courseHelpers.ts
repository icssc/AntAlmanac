import type { AACourse } from '@packages/antalmanac-types';

export function getCourseIdFromParts(deptCode: string, courseNumber: string) {
    return `${deptCode}${courseNumber}`;
}

export function getCourseId(course: AACourse) {
    return getCourseIdFromParts(course.deptCode, course.courseNumber);
}

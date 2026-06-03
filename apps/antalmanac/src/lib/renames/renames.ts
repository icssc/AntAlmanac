import { buildCourseId } from '@packages/anteater-api/utils';

export interface CourseId {
    /** Anteater API / planner course id, e.g. "ICS31" */
    courseId: string;
    department: string;
    courseNumber: string;
}

// `effectiveYear` is the fall-start year the new name first appeared.
// Chains (A → B → C) use two consecutive entries.
export interface CourseRename extends CourseId {
    previously: CourseId;
    effectiveYear: number;
}

function courseIdFields(department: string, courseNumber: string): CourseId {
    return {
        department,
        courseNumber,
        courseId: buildCourseId(department, courseNumber),
    };
}

function courseRename(
    department: string,
    courseNumber: string,
    previously: { department: string; courseNumber: string },
    effectiveYear: number
): CourseRename {
    return {
        ...courseIdFields(department, courseNumber),
        previously: courseIdFields(previously.department, previously.courseNumber),
        effectiveYear,
    };
}

export const COURSE_RENAMES: CourseRename[] = [
    courseRename('SWE', '43', { department: 'IN4MATX', courseNumber: '43' }, 2026),
    courseRename('SWE', '113', { department: 'IN4MATX', courseNumber: '113' }, 2026),
    courseRename('SWE', '115', { department: 'IN4MATX', courseNumber: '115' }, 2026),
    courseRename('SWE', '117', { department: 'IN4MATX', courseNumber: '117' }, 2026),
    courseRename('SWE', '119', { department: 'IN4MATX', courseNumber: '119' }, 2026),
    courseRename('SWE', '121', { department: 'IN4MATX', courseNumber: '121' }, 2026),
    courseRename('SWE', '122', { department: 'IN4MATX', courseNumber: '122' }, 2026),
    courseRename('SWE', '124', { department: 'IN4MATX', courseNumber: '124' }, 2026),
    courseRename('SWE', '141', { department: 'IN4MATX', courseNumber: '141' }, 2026),
    courseRename('I&C SCI', 'H32', { department: 'I&C SCI', courseNumber: '32A' }, 2024),
];

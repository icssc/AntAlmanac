import AppStore from '$stores/AppStore';
import { usePlannerStore } from '$stores/PlannerStore';
import type { AACourseWithTerm, AATerm } from '@packages/antalmanac-types';
import type { WebsocAPIResponse, WebsocDepartment, WebsocSchool } from '@packages/anteater-api/types';

export type CourseListEntry = WebsocSchool | WebsocDepartment | AACourseWithTerm;

export function isSchoolEntry(item: CourseListEntry): item is WebsocSchool {
    return 'departments' in item;
}

export function isDepartmentEntry(item: CourseListEntry): item is WebsocDepartment {
    return 'courses' in item;
}

export function isCourseEntry(item: CourseListEntry): item is AACourseWithTerm {
    return 'sections' in item && 'deptCode' in item && 'courseNumber' in item && 'term' in item;
}

export function getCourseColors() {
    const currentCourses = AppStore.schedule.getCurrentCourses();
    return currentCourses.reduce<Record<string, string>>((accumulator, course) => {
        for (const section of course.sections) {
            accumulator[section.sectionCode] = section.color;
        }
        return accumulator;
    }, {});
}

export function flattenSOCObject(
    SOCObject: WebsocAPIResponse,
    term: AATerm,
    courseColors: Record<string, string>
): CourseListEntry[] {
    return SOCObject.schools.reduce((accumulator: CourseListEntry[], school) => {
        accumulator.push(school);

        school.departments.forEach((dept) => {
            accumulator.push(dept);

            dept.courses.forEach((course) => {
                accumulator.push({
                    ...course,
                    term,
                    sections: course.sections.map((section) => ({
                        ...section,
                        color: courseColors[section.sectionCode],
                    })),
                    sectionTypes: Array.from(new Set(course.sections.map((section) => section.sectionType))),
                });
            });
        });

        return accumulator;
    }, []);
}

export function estimateCoursePaneLazyHeight(entry: CourseListEntry): number {
    return isCourseEntry(entry) ? entry.sections.length * 60 + 20 + 40 : 200;
}

function cleanHeaders(items: CourseListEntry[]): CourseListEntry[] {
    const result: CourseListEntry[] = [];
    let pendingSchool: WebsocSchool | null = null;
    let pendingDept: WebsocDepartment | null = null;

    for (const item of items) {
        if (isSchoolEntry(item)) {
            pendingSchool = item;
            pendingDept = null;
        } else if (isDepartmentEntry(item)) {
            pendingDept = item;
        } else {
            if (pendingSchool) {
                result.push(pendingSchool);
                pendingSchool = null;
            }
            if (pendingDept) {
                result.push(pendingDept);
                pendingDept = null;
            }
            result.push(item);
        }
    }

    return result;
}

export function getFilteredCourses(allCourses: CourseListEntry[], manualSearchEnabled: boolean): CourseListEntry[] {
    const { filterTakenCourses, userTakenCourses } = usePlannerStore.getState();
    if (manualSearchEnabled && filterTakenCourses && userTakenCourses.size > 0) {
        const filtered = allCourses.filter((item) => {
            if (isCourseEntry(item)) {
                return !userTakenCourses.has(item.courseId);
            }
            return true;
        });
        return cleanHeaders(filtered);
    }
    return allCourses;
}

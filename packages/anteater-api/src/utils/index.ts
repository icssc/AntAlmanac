import type { WebsocAPIResponse, WebsocCourse, WebsocSection } from '@packages/anteater-api/types';

function compareCourses(a: WebsocCourse, b: WebsocCourse) {
    const aNum = Number.parseInt(a.courseNumber.replaceAll(/\D/g, ''), 10);
    const bNum = Number.parseInt(b.courseNumber.replaceAll(/\D/g, ''), 10);
    if (Number.isNaN(aNum) && Number.isNaN(bNum)) return a.courseNumber.localeCompare(b.courseNumber);
    if (Number.isNaN(aNum)) return 1;
    if (Number.isNaN(bNum)) return -1;
    const diff = Math.sign(aNum - bNum);
    return diff === 0 ? a.courseNumber.localeCompare(b.courseNumber) : diff;
}

function compareSectionCodes(a: WebsocSection, b: WebsocSection) {
    const aCode = Number.parseInt(a.sectionCode, 10);
    const bCode = Number.parseInt(b.sectionCode, 10);
    if (Number.isNaN(aCode) && Number.isNaN(bCode)) return a.sectionCode.localeCompare(b.sectionCode);
    if (Number.isNaN(aCode)) return 1;
    if (Number.isNaN(bCode)) return -1;
    return aCode - bCode;
}

/**
 * Sorts a WebSOC response in-place: schools by name, departments by code,
 * courses by course number, sections by section code.
 */
export function sortWebsocResponse(response: WebsocAPIResponse): WebsocAPIResponse {
    response.schools.sort((a, b) => a.schoolName.localeCompare(b.schoolName));
    for (const school of response.schools) {
        school.departments.sort((a, b) => a.deptCode.localeCompare(b.deptCode));
        for (const department of school.departments) {
            department.courses.sort(compareCourses);
            for (const course of department.courses) {
                course.sections.sort(compareSectionCodes);
            }
        }
    }
    return response;
}

/** Stable identity for a course across WebSOC responses (dept + number, whitespace stripped). */
export function websocCourseKey(deptCode: string, courseNumber: string): string {
    return `${deptCode}::${courseNumber}`.replace(/\s+/g, '');
}

/**
 * Fold several WebSOC responses into a single tree.
 *
 * - Schools and departments match on name / code and get merged.
 * - Each course appears at most once per department; if it shows up in more than one
 *   response, section lists are combined and deduped by section code.
 */
export function unionWebsocResponses(responses: WebsocAPIResponse[]): WebsocAPIResponse {
    const combined: WebsocAPIResponse = { schools: [] };

    for (const res of responses) {
        for (const school of res.schools) {
            let combinedSchool = combined.schools.find((s) => s.schoolName === school.schoolName);
            if (!combinedSchool) {
                combinedSchool = { ...school, departments: [] };
                combined.schools.push(combinedSchool);
            }

            for (const dept of school.departments) {
                let combinedDept = combinedSchool.departments.find((d) => d.deptCode === dept.deptCode);
                if (!combinedDept) {
                    combinedDept = { ...dept, courses: [] };
                    combinedSchool.departments.push(combinedDept);
                }

                for (const course of dept.courses) {
                    const existingCourse = combinedDept.courses.find((c) => c.courseNumber === course.courseNumber);
                    if (existingCourse) {
                        const sectionMap = new Map(existingCourse.sections.map((s) => [s.sectionCode, s]));
                        for (const section of course.sections) {
                            sectionMap.set(section.sectionCode, section);
                        }
                        existingCourse.sections = [...sectionMap.values()].sort(compareSectionCodes);
                    } else {
                        combinedDept.courses.push(course);
                    }
                }

                combinedDept.courses.sort(compareCourses);
            }
        }
    }

    return combined;
}

/** Courses that appear in every response (layout from the first). Sections are not merged. */
export function intersectWebsocResponses(responses: WebsocAPIResponse[]): WebsocAPIResponse {
    if (responses.length === 0) {
        return { schools: [] };
    }

    const first = responses[0]!;

    let intersectionCourseKeys: Set<string> | null = null;

    for (const response of responses) {
        const keys = new Set<string>();
        for (const school of response.schools) {
            for (const dept of school.departments) {
                for (const course of dept.courses) {
                    keys.add(websocCourseKey(course.deptCode, course.courseNumber));
                }
            }
        }

        if (intersectionCourseKeys === null) {
            intersectionCourseKeys = keys;
        } else {
            intersectionCourseKeys = intersectionCourseKeys.intersection(keys);
            if (intersectionCourseKeys.size === 0) {
                return { schools: [] };
            }
        }
    }

    if (intersectionCourseKeys === null) {
        return { schools: [] };
    }

    const schools = first.schools
        .map((school) => ({
            ...school,
            departments: school.departments
                .map((dept) => ({
                    ...dept,
                    courses: dept.courses.filter((c) =>
                        intersectionCourseKeys.has(websocCourseKey(c.deptCode, c.courseNumber))
                    ),
                }))
                .filter((dept) => dept.courses.length > 0),
        }))
        .filter((school) => school.departments.length > 0);

    return { schools };
}

export function flattenCourses(response: WebsocAPIResponse): WebsocCourse[] {
    return response.schools.flatMap((school) => school.departments.flatMap((dept) => dept.courses));
}

export function flattenSections(response: WebsocAPIResponse): WebsocSection[] {
    return flattenCourses(response).flatMap((course) => course.sections);
}

export function flattenSectionsWithCourse(
    response: WebsocAPIResponse
): { section: WebsocSection; course: WebsocCourse }[] {
    return flattenCourses(response).flatMap((course) => course.sections.map((section) => ({ section, course })));
}

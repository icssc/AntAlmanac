import type { WebsocAPIResponse, WebsocCourse, WebsocSection } from '$types/index';

function compareCourses(a: WebsocCourse, b: WebsocCourse) {
    const aNum = Number.parseInt(a.courseNumber.replaceAll(/\D/g, ''), 10);
    const bNum = Number.parseInt(b.courseNumber.replaceAll(/\D/g, ''), 10);
    const diff = Math.sign(aNum - bNum);
    return diff === 0 ? a.courseNumber.localeCompare(b.courseNumber) : diff;
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
                course.sections.sort((a, b) => Number.parseInt(a.sectionCode, 10) - Number.parseInt(b.sectionCode, 10));
            }
        }
    }
    return response;
}

/**
 * Merges multiple WebSOC responses into one, deduplicating schools and departments
 * by name/code, merging courses by course number, and merging sections by section code.
 */
export function combineWebsocResponses(responses: WebsocAPIResponse[]): WebsocAPIResponse {
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
                        // merge sections, dedup by sectionCode
                        const sectionMap = new Map(existingCourse.sections.map((s) => [s.sectionCode, s]));
                        for (const section of course.sections) {
                            sectionMap.set(section.sectionCode, section);
                        }
                        existingCourse.sections = [...sectionMap.values()].sort(
                            (a, b) => Number.parseInt(a.sectionCode, 10) - Number.parseInt(b.sectionCode, 10)
                        );
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

/** Returns every course flattened out of the schools/departments tree. */
export function flattenCourses(response: WebsocAPIResponse): WebsocCourse[] {
    return response.schools.flatMap((school) => school.departments.flatMap((dept) => dept.courses));
}

/** Returns every section flattened out of the schools/departments/courses tree. */
export function flattenSections(response: WebsocAPIResponse): WebsocSection[] {
    return flattenCourses(response).flatMap((course) => course.sections);
}

/** Returns every section paired with its parent course, flattened from the tree. */
export function flattenSectionsWithCourse(
    response: WebsocAPIResponse
): { section: WebsocSection; course: WebsocCourse }[] {
    return response.schools.flatMap((school) =>
        school.departments.flatMap((dept) =>
            dept.courses.flatMap((course) => course.sections.map((section) => ({ section, course })))
        )
    );
}

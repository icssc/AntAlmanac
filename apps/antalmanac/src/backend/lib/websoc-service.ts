import type { WebsocAPIResponse, CourseInfo, WebsocCourse, WebsocSectionType } from '@packages/antalmanac-types';

function sanitizeSearchParams(params: Record<string, string>) {
    if ('term' in params) {
        const termValue = params.term;
        const termParts = termValue.split(' ');
        if (termParts.length === 2) {
            const [year, quarter] = termParts;
            delete params.term;
            params.quarter = quarter;
            params.year = year;
        }
    }
    if ('department' in params) {
        if (params.department.toUpperCase() === 'ALL') {
            delete params.department;
        } else {
            params.department = params.department.toUpperCase();
        }
    }
    if ('courseNumber' in params) {
        params.courseNumber = params.courseNumber.toUpperCase();
    }
    for (const [key, value] of Object.entries(params)) {
        if (value === '') {
            delete params[key];
        }
    }
    return params;
}

function compareCourses(a: WebsocCourse, b: WebsocCourse) {
    const aNum = Number.parseInt(a.courseNumber.replaceAll(/\D/g, ''), 10);
    const bNum = Number.parseInt(b.courseNumber.replaceAll(/\D/g, ''), 10);
    const diffSign = Math.sign(aNum - bNum);
    return diffSign === 0 ? a.courseNumber.localeCompare(b.courseNumber) : diffSign;
}

function sortWebsocResponse(response: WebsocAPIResponse) {
    response.schools.sort((a, b) => a.schoolName.localeCompare(b.schoolName));
    for (const school of response.schools) {
        school.departments.sort((a, b) => a.deptCode.localeCompare(b.deptCode));
        for (const department of school.departments) {
            department.courses.sort(compareCourses);
            for (const course of department.courses) {
                course.sections.sort((a, b) =>
                    Math.sign(Number.parseInt(a.sectionCode, 10) - Number.parseInt(b.sectionCode, 10))
                );
            }
        }
    }
    return response;
}

export async function queryWebSoc(input: Record<string, string>): Promise<WebsocAPIResponse> {
    const url = `https://anteaterapi.com/v2/rest/websoc?${new URLSearchParams(sanitizeSearchParams(input))}`;
    console.log('queryWebSoc', url);

    const response = await fetch(url, {
        headers: {
            ...(process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
        },
    });
    const data = await response.json();
    console.log('queryWebSoc', data);
    return sortWebsocResponse(data.data as WebsocAPIResponse);
}

export function combineWebsocResponses(responses: WebsocAPIResponse[]) {
    const combined: WebsocAPIResponse = { schools: [] };
    for (const res of responses) {
        for (const school of res.schools) {
            const schoolIndex = combined.schools.findIndex((s) => s.schoolName === school.schoolName);
            if (schoolIndex !== -1) {
                for (const dept of school.departments) {
                    const deptIndex = combined.schools[schoolIndex].departments.findIndex(
                        (d) => d.deptCode === dept.deptCode
                    );
                    if (deptIndex !== -1) {
                        const courses = new Set(combined.schools[schoolIndex].departments[deptIndex].courses);
                        for (const course of dept.courses) {
                            courses.add(course);
                        }
                        const coursesArray = Array.from(courses);
                        coursesArray.sort(compareCourses);
                        combined.schools[schoolIndex].departments[deptIndex].courses = coursesArray;
                    } else {
                        combined.schools[schoolIndex].departments.push(dept);
                    }
                }
            } else {
                combined.schools.push(school);
            }
        }
    }
    return combined;
}

export async function getCourseInfo(input: Record<string, string>): Promise<{ [sectionCode: string]: CourseInfo }> {
    const res = await queryWebSoc(input);
    const courseInfo: { [sectionCode: string]: CourseInfo } = {};

    for (const school of res.schools) {
        for (const department of school.departments) {
            for (const course of department.courses) {
                const sectionTypesSet = new Set<WebsocSectionType>();
                course.sections.forEach((section) => {
                    sectionTypesSet.add(section.sectionType);
                });

                const sectionTypes = [...sectionTypesSet];

                for (const section of course.sections) {
                    courseInfo[section.sectionCode] = {
                        courseDetails: {
                            deptCode: department.deptCode,
                            courseNumber: course.courseNumber,
                            courseTitle: course.courseTitle,
                            courseComment: course.courseComment,
                            prerequisiteLink: course.prerequisiteLink,
                            sectionTypes: sectionTypes,
                        },
                        section: section,
                    };
                }
            }
        }
    }

    return courseInfo;
}

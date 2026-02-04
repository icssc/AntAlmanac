import type { WebsocAPIResponse, CourseInfo, WebsocCourse, WebsocSectionType } from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

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

/**
 * Comparison for two courses based on their course number.
 * If the numeric part of their course number is the same,
 * returns the lexicographic ordering of their course number.
 */
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

const queryWebSoc = async ({ input }: { input: Record<string, string> }) => {
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
};

function combineWebsocResponses(responses: WebsocAPIResponse[]) {
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

const websocRouter = router({
    getOne: procedure.input(z.record(z.string(), z.string())).query(queryWebSoc),
    getMany: procedure
        .input(z.object({ params: z.record(z.string(), z.string()), fieldName: z.string() }))
        .query(async ({ input }) => {
            const responses: WebsocAPIResponse[] = [];
            for (const field of input.params[input.fieldName].trim().replace(' ', '').split(',')) {
                const req = JSON.parse(JSON.stringify(input.params)) as Record<string, string>;
                req[input.fieldName] = field;
                responses.push(await queryWebSoc({ input: req }));
            }
            return combineWebsocResponses(responses);
        }),
    getCourseInfo: procedure.input(z.record(z.string(), z.string())).query(async ({ input }) => {
        const res = await queryWebSoc({ input });
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
    }),
});

export default websocRouter;

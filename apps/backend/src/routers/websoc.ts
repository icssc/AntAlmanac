import { z } from 'zod';
import type { WebsocAPIResponse } from '@packages/antalmanac-types';
import { procedure, router } from '../trpc';
import type { CourseInfo } from '$aa/src/lib/course_data.types';

function cleanSearchParams(record: Record<string, string>) {
    if ('term' in record) {
        const termValue = record['term'];
        const termParts = termValue.split(' ');
        if (termParts.length === 2) {
            const [year, quarter] = termParts;
            delete record['term'];
            record['quarter'] = quarter;
            record['year'] = year;
        }
    }
    if ('department' in record) {
        record['department'] = record['department'].toUpperCase();
    }
    for (const [key, value] of Object.entries(record)) {
        if (value === '') {
            delete record[key];
        }
    }
    return record;
}

const queryWebSoc = async ({ input }: { input: Record<string, string> }) =>
    await fetch(`https://anteaterapi.com/v2/rest/websoc?${new URLSearchParams(cleanSearchParams(input))}`, {
        headers: {
            ...(process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
        },
    })
        .then((data) => data.json())
        .then((data) => data.data as WebsocAPIResponse);

function combineSOCObjects(SOCObjects: WebsocAPIResponse[]) {
    const combined = SOCObjects.shift() as WebsocAPIResponse;
    for (const res of SOCObjects) {
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
                        coursesArray.sort(
                            (left, right) =>
                                parseInt(left.courseNumber.replace(/\D/g, '')) -
                                parseInt(right.courseNumber.replace(/\D/g, ''))
                        );
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
            return combineSOCObjects(responses);
        }),
    getCourseInfo: procedure.input(z.record(z.string(), z.string())).query(async ({ input }) => {
        const res = await queryWebSoc({ input });
        const courseInfo: { [sectionCode: string]: CourseInfo } = {};
        for (const school of res.schools) {
            for (const department of school.departments) {
                for (const course of department.courses) {
                    for (const section of course.sections) {
                        courseInfo[section.sectionCode] = {
                            courseDetails: {
                                deptCode: department.deptCode,
                                courseNumber: course.courseNumber,
                                courseTitle: course.courseTitle,
                                courseComment: course.courseComment,
                                prerequisiteLink: course.prerequisiteLink,
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

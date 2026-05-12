import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import type { CourseInfo } from '@packages/antalmanac-types';
import type {
    WebsocAPIResponse,
    WebsocSectionType,
    WebsocSyllabiQueryParams,
    WebsocSyllabiResponse,
} from '@packages/anteater-api/types';
import { combineWebsocResponses, sortWebsocResponse } from '@packages/anteater-api/utils';
import { z } from 'zod';

import { router } from '../trpc';

type WebsocQueryParams = Parameters<typeof aapiClient.websoc.query>[0];

function sanitizeWebsocParams(params: Record<string, string>): WebsocQueryParams {
    const p = { ...params };
    if ('term' in p) {
        const [year, quarter] = p.term.split(' ');
        delete p.term;
        if (year && quarter) {
            p.year = year;
            p.quarter = quarter;
        }
    }
    if ('department' in p) {
        if (p.department.toUpperCase() === 'ALL') {
            delete p.department;
        } else {
            p.department = p.department.toUpperCase();
        }
    }
    if ('courseNumber' in p) {
        p.courseNumber = p.courseNumber.toUpperCase();
    }
    for (const [key, value] of Object.entries(p)) {
        if (value === '') delete p[key];
    }
    return p as unknown as WebsocQueryParams;
}

async function queryWebsoc(rawParams: Record<string, string>): Promise<WebsocAPIResponse> {
    return sortWebsocResponse(await aapiClient.websoc.query(sanitizeWebsocParams(rawParams)));
}

const websocRouter = router({
    getOne: aapiProcedure
        .input(z.record(z.string(), z.string()))
        .query(({ input }): Promise<WebsocAPIResponse> => queryWebsoc(input)),

    getManyOfField: aapiProcedure
        .input(z.object({ params: z.record(z.string(), z.string()), fieldName: z.string() }))
        .query(({ input }): Promise<WebsocAPIResponse> => {
            const fields = input.params[input.fieldName].trim().replaceAll(' ', '').split(',');
            return Promise.all(fields.map((field) => queryWebsoc({ ...input.params, [input.fieldName]: field }))).then(
                combineWebsocResponses
            );
        }),

    getMultiple: aapiProcedure
        .input(z.object({ params: z.array(z.record(z.string(), z.string())) }))
        .query(
            ({ input }): Promise<WebsocAPIResponse> =>
                Promise.all(input.params.map(queryWebsoc)).then(combineWebsocResponses)
        ),

    getCourseInfo: aapiProcedure
        .input(z.record(z.string(), z.string()))
        .query(async ({ input }): Promise<Record<string, CourseInfo>> => {
            const res = await queryWebsoc(input);

            const entries = res.schools.flatMap((school) =>
                school.departments.flatMap((dept) =>
                    dept.courses.flatMap((course) => {
                        const sectionTypes = [...new Set<WebsocSectionType>(course.sections.map((s) => s.sectionType))];
                        return course.sections.map(
                            (section) =>
                                [
                                    section.sectionCode,
                                    {
                                        courseDetails: {
                                            deptCode: dept.deptCode,
                                            courseNumber: course.courseNumber,
                                            courseTitle: course.courseTitle,
                                            courseComment: course.courseComment,
                                            prerequisiteLink: course.prerequisiteLink,
                                            sectionTypes,
                                        },
                                        section,
                                    } satisfies CourseInfo,
                                ] as const
                        );
                    })
                )
            );
            return Object.fromEntries(entries);
        }),

    getSyllabi: aapiProcedure
        .input(
            z.object({
                courseId: z.string(),
                year: z.string().optional(),
                quarter: z.string().optional(),
                instructor: z.string().optional(),
            })
        )
        .query(
            ({ input }): Promise<WebsocSyllabiResponse> =>
                aapiClient.websoc.getSyllabi(input as WebsocSyllabiQueryParams)
        ),
});

export default websocRouter;

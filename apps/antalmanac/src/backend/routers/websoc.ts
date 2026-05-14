import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import type { CourseInfo } from '@packages/antalmanac-types';
import type {
    WebsocAPIResponse,
    WebsocQueryParams,
    WebsocSectionType,
    WebsocSyllabiQueryParams,
    WebsocSyllabiResponse,
} from '@packages/anteater-api/types';
import { combineWebsocResponses, sortWebsocResponse } from '@packages/anteater-api/utils';
import { z } from 'zod';

import { router } from '../trpc';

export const websocSearchInputSchema = z.object({
    year: z.string(),
    quarter: z.string(),
    department: z.string().optional(),
    ge: z.string().optional(),
    courseNumber: z.string().optional(),
    sectionCodes: z.string().optional(),
    instructorName: z.string().optional(),
    units: z.string().optional(),
    endTime: z.string().optional(),
    startTime: z.string().optional(),
    fullCourses: z.string().optional(),
    building: z.string().optional(),
    room: z.string().optional(),
    division: z.string().optional(),
    excludeRestrictionCodes: z.string().optional(),
    days: z.string().optional(),
});

export type WebsocSearchInput = z.infer<typeof websocSearchInputSchema>;

function sanitizeWebsocParams(params: WebsocSearchInput): WebsocQueryParams {
    const { department, courseNumber, ...rest } = params;
    const sanitized: Record<string, string> = { ...rest };
    if (department && department.toUpperCase() !== 'ALL') {
        sanitized.department = department.toUpperCase();
    }
    if (courseNumber) {
        sanitized.courseNumber = courseNumber.toUpperCase();
    }
    for (const [key, value] of Object.entries(sanitized)) {
        if (value === '') delete sanitized[key];
    }
    return sanitized as WebsocQueryParams;
}

async function queryWebsoc(rawParams: WebsocSearchInput): Promise<WebsocAPIResponse> {
    return sortWebsocResponse(await aapiClient.websoc.query(sanitizeWebsocParams(rawParams)));
}

const websocRouter = router({
    getOne: aapiProcedure
        .input(websocSearchInputSchema)
        .query(({ input }): Promise<WebsocAPIResponse> => queryWebsoc(input)),

    getManyOfField: aapiProcedure
        .input(z.object({ params: websocSearchInputSchema, fieldName: z.string() }))
        .query(({ input }): Promise<WebsocAPIResponse> => {
            const fieldValue = input.params[input.fieldName as keyof WebsocSearchInput];
            if (!fieldValue) return queryWebsoc(input.params);
            const fields = fieldValue.trim().replaceAll(' ', '').split(',');
            return Promise.all(fields.map((field) => queryWebsoc({ ...input.params, [input.fieldName]: field }))).then(
                combineWebsocResponses
            );
        }),

    getMultiple: aapiProcedure
        .input(z.object({ params: z.array(websocSearchInputSchema) }))
        .query(
            ({ input }): Promise<WebsocAPIResponse> =>
                Promise.all(input.params.map(queryWebsoc)).then(combineWebsocResponses)
        ),

    getCourseInfo: aapiProcedure
        .input(websocSearchInputSchema)
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

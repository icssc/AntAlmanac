import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { QuarterSchema, type CourseInfo } from '@packages/antalmanac-types';
import { WebsocSearchInputSchema, type WebsocSearchInput } from '@packages/antalmanac-types';
import type {
    WebsocAPIResponse,
    WebsocQueryParams,
    WebsocSectionType,
    WebsocSyllabiResponse,
} from '@packages/anteater-api/types';
import { combineWebsocResponses, sortWebsocResponse } from '@packages/anteater-api/utils';
import { z } from 'zod';

import { router } from '../trpc';

function sanitizeWebsocParams(params: WebsocSearchInput): WebsocQueryParams {
    const { department, courseNumber, ...rest } = params;
    const sanitized: Record<string, string | null | undefined> = { ...rest };
    if (department && department.toUpperCase() !== 'ALL') {
        sanitized.department = department.toUpperCase();
    }
    if (courseNumber) {
        sanitized.courseNumber = courseNumber.toUpperCase();
    }
    for (const [key, value] of Object.entries(sanitized)) {
        if (value === '' || value == null) delete sanitized[key];
    }
    return sanitized as WebsocQueryParams;
}

async function queryWebsoc(rawParams: WebsocSearchInput): Promise<WebsocAPIResponse> {
    return sortWebsocResponse(await aapiClient.websoc.query(sanitizeWebsocParams(rawParams)));
}

const websocRouter = router({
    getOne: aapiProcedure
        .input(WebsocSearchInputSchema)
        .query(({ input }): Promise<WebsocAPIResponse> => queryWebsoc(input)),

    getManyOfField: aapiProcedure
        .input(z.object({ params: WebsocSearchInputSchema, fieldName: z.string() }))
        .query(({ input }): Promise<WebsocAPIResponse> => {
            const fieldValue = input.params[input.fieldName as keyof WebsocSearchInput];
            if (!fieldValue) return queryWebsoc(input.params);
            const fields = fieldValue.trim().replaceAll(' ', '').split(',');
            return Promise.all(fields.map((field) => queryWebsoc({ ...input.params, [input.fieldName]: field }))).then(
                combineWebsocResponses
            );
        }),

    getMultiple: aapiProcedure
        .input(z.object({ params: z.array(WebsocSearchInputSchema) }))
        .query(
            ({ input }): Promise<WebsocAPIResponse> =>
                Promise.all(input.params.map(queryWebsoc)).then(combineWebsocResponses)
        ),

    getCourseInfo: aapiProcedure
        .input(WebsocSearchInputSchema)
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
                quarter: QuarterSchema.optional(),
                instructor: z.string().optional(),
            })
        )
        .query(({ input }): Promise<WebsocSyllabiResponse> => aapiClient.websoc.getSyllabi(input)),
});

export default websocRouter;

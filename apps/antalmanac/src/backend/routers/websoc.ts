import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { QuarterSchema, WebsocSearchInputKeysSchema, type CourseInfo } from '@packages/antalmanac-types';
import { WebsocSearchInputSchema, type WebsocSearchInput } from '@packages/antalmanac-types';
import type {
    WebsocAPIResponse,
    WebsocQueryParams,
    WebsocSectionType,
    WebsocSyllabiResponse,
} from '@packages/anteater-api/types';
import { sortWebsocResponse, unionWebsocResponses } from '@packages/anteater-api/utils';
import { z } from 'zod';

import { router } from '../trpc';

function sanitizeWebsocParams(params: WebsocSearchInput): WebsocQueryParams {
    const { department, courseNumber, ...rest } = params;
    const sanitized: typeof params = { ...rest };

    if (department && department.toUpperCase() !== 'ALL') {
        sanitized.department = department.toUpperCase();
    }

    if (courseNumber) {
        sanitized.courseNumber = courseNumber.toUpperCase();
    }

    for (const key of Object.keys(sanitized) as (keyof typeof sanitized)[]) {
        const value = sanitized[key];
        if (value === '' || value === null || value === undefined) {
            delete sanitized[key];
        }
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
        .input(
            z.object({
                params: WebsocSearchInputSchema,
                fieldName: z.enum([WebsocSearchInputKeysSchema.enum.ge]),
            })
        )
        .query(async ({ input }): Promise<WebsocAPIResponse[]> => {
            const { fieldName, params } = input;
            const fieldValue = params[fieldName]?.trim().replaceAll(' ', '');
            const fields = fieldValue?.split(',').filter((value) => value.length > 0);

            if (!fields?.length) {
                return [await queryWebsoc(params)];
            }

            return Promise.all(fields.map((value) => queryWebsoc({ ...params, [fieldName]: value })));
        }),

    getMultiple: aapiProcedure
        .input(z.object({ params: z.array(WebsocSearchInputSchema) }))
        .query(
            ({ input }): Promise<WebsocAPIResponse> =>
                Promise.all(input.params.map(queryWebsoc)).then(unionWebsocResponses)
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
                                            sections: course.sections,
                                            updatedAt: course.updatedAt,
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

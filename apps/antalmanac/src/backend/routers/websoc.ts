import { aapiClient, aapiProcedure } from '$backend/lib/aapi';
import { router } from '$backend/trpc';
import { getRenamedCoursesIdentifiers } from '$lib/renames/utils';
import {
    type AACourse,
    QuarterSchema,
    type WebsocSearchInput,
    WebsocSearchInputKeysSchema,
    WebsocSearchInputSchema,
} from '@packages/antalmanac-types';
import type {
    WebsocAPIResponse,
    WebsocQueryParams,
    WebsocSectionType,
    WebsocSyllabiResponse,
} from '@packages/anteater-api/types';
import { sortWebsocResponse, unionWebsocResponses } from '@packages/anteater-api/utils';
import { z } from 'zod';

function sanitizeWebsocParams(params: WebsocSearchInput): WebsocQueryParams {
    const { department, courseNumber, excludeRestrictionCodes, days, ...rest } = params;
    const sanitized = {
        ...rest,
        excludeRestrictionCodes: excludeRestrictionCodes.join(','),
        days: days.join(','),
    } as WebsocQueryParams;

    const normalizedDepartment = department?.toUpperCase();
    if (normalizedDepartment && normalizedDepartment !== 'ALL') {
        sanitized.department = normalizedDepartment;
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

    return sanitized;
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
        .query(async ({ input }): Promise<Record<string, AACourse>> => {
            const res = await queryWebsoc(input);

            const entries = res.schools.flatMap((school) =>
                school.departments.flatMap((dept) =>
                    dept.courses.flatMap((course) => {
                        const sectionTypes = [...new Set<WebsocSectionType>(course.sections.map((s) => s.sectionType))];
                        const aaCourse = {
                            courseId: course.courseId,
                            deptCode: course.deptCode,
                            courseNumber: course.courseNumber,
                            courseTitle: course.courseTitle,
                            courseComment: course.courseComment,
                            prerequisiteLink: course.prerequisiteLink,
                            updatedAt: course.updatedAt,
                            sectionTypes,
                            sections: course.sections.map((section) => ({ ...section, color: '' })),
                        } satisfies AACourse;

                        return course.sections.map((section) => [section.sectionCode, aaCourse] as const);
                    })
                )
            );
            return Object.fromEntries(entries);
        }),

    getSyllabi: aapiProcedure
        .input(
            z.object({
                department: z.string(),
                courseNumber: z.string(),
                year: z.string().optional(),
                quarter: QuarterSchema.optional(),
                instructor: z.string().optional(),
            })
        )
        .query(async ({ input }): Promise<WebsocSyllabiResponse> => {
            const { department, courseNumber, ...rest } = input;
            const identifiers = getRenamedCoursesIdentifiers(department, courseNumber);

            const results = await Promise.all(
                identifiers.map(({ courseId }) => aapiClient.websoc.getSyllabi({ ...rest, courseId }))
            );

            return results.flat();
        }),
});

export default websocRouter;

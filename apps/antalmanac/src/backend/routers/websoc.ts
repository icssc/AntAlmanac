import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { QuarterSchema, type CourseInfo } from '@packages/antalmanac-types';
import { WebsocSearchInputSchema, type WebsocSearchInput } from '@packages/antalmanac-types';
import type {
    WebsocAPIResponse,
    WebsocQueryParams,
    WebsocSectionType,
    WebsocSyllabiResponse,
} from '@packages/anteater-api/types';
import { intersectWebsocResponses, sortWebsocResponse, unionWebsocResponses } from '@packages/anteater-api/utils';
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

    getGeIntersection: aapiProcedure
        .input(z.object({ params: WebsocSearchInputSchema, ges: z.array(z.string()).min(2) }))
        .query(
            ({ input }): Promise<WebsocAPIResponse> =>
                Promise.all(input.ges.map((ge) => queryWebsoc({ ...input.params, ge }))).then(intersectWebsocResponses)
        ),

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

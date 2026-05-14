import { QuarterSchema } from '$lib/term';
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

function sanitizeWebsocParams({ department, courseNumber, ...rest }: WebsocQueryParams): WebsocQueryParams {
    const p: Partial<WebsocQueryParams> = { ...rest };
    if (department && department.toUpperCase() !== 'ALL') {p.department = department.toUpperCase();}
    if (courseNumber) {p.courseNumber = courseNumber.toUpperCase();}
    return p;
}

async function queryWebsoc(params: WebsocQueryParams): Promise<WebsocAPIResponse> {
    return sortWebsocResponse(await aapiClient.websoc.query(sanitizeWebsocParams(params)));
}

const websocInput = z.custom<WebsocQueryParams>(
    (v) => typeof v === 'object' && v !== null && 'year' in v && 'quarter' in v
);

const websocRouter = router({
    getOne: aapiProcedure
        .input(websocInput)
        .query(({ input }): Promise<WebsocAPIResponse> => queryWebsoc(input)),

    // !
    getManyOfField: aapiProcedure
        .input(z.object({ params: websocInput, fieldName: z.string() }))
        .query(({ input }): Promise<WebsocAPIResponse> => {
            const fields = (String(input.params[input.fieldName as keyof WebsocQueryParams] ?? ''))
                .trim()
                .replaceAll(' ', '')
                .split(',');
            return Promise.all(
                fields.map((field) => queryWebsoc({ ...input.params, [input.fieldName]: field }))
            ).then(combineWebsocResponses);
        }),

    getMultiple: aapiProcedure
        .input(z.object({ params: z.array(websocInput) }))
        .query(
            ({ input }): Promise<WebsocAPIResponse> =>
                Promise.all(input.params.map(queryWebsoc)).then(combineWebsocResponses)
        ),

    getCourseInfo: aapiProcedure
        .input(z.object({ year: z.string(), quarter: QuarterSchema, sectionCodes: z.string() }))
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
        .query(
            ({ input }): Promise<WebsocSyllabiResponse> =>
                aapiClient.websoc.getSyllabi(input)
        ),
});

export default websocRouter;

import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { getRenamedCoursesIdentifiers } from '$src/lib/renames/utils';
import { AAPIError } from '@packages/anteater-api/client';
import type { Course, CoursesBatchAPIResult } from '@packages/anteater-api/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router } from '../trpc';

const courseRouter = router({
    get: aapiProcedure
        .input(z.object({ department: z.string(), courseNumber: z.string() }))
        .query(async ({ input }): Promise<Course> => {
            const courseIds = getRenamedCoursesIdentifiers(input.department, input.courseNumber).map(
                ({ department, courseNumber }) => department.replaceAll(' ', '') + courseNumber
            );
            const results = await Promise.allSettled(courseIds.map((id) => aapiClient.courses.get(id)));

            for (const result of results) {
                if (result.status === 'fulfilled') {
                    return result.value;
                }

                const e = result.reason;
                // AAPI returns 404 when the courseId does not exist — try predecessor names.
                if (e instanceof AAPIError && e.status === 404) {
                    continue;
                }

                throw e;
            }

            throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
        }),

    getMultiple: aapiProcedure
        .input(z.object({ courseIds: z.array(z.string()) }))
        .query(({ input }): Promise<CoursesBatchAPIResult['data']> => aapiClient.courses.getBatch(input.courseIds)),
});

export default courseRouter;

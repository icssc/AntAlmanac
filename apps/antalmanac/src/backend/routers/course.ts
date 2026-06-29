import { aapiClient, aapiProcedure } from '$backend/lib/aapi';
import { router } from '$backend/trpc';
import { getRenamedCoursesIdentifiers } from '$lib/renames/utils';
import { AAPIError } from '@packages/anteater-api/client';
import type { Course, CoursesBatchAPIResult } from '@packages/anteater-api/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const courseRouter = router({
    get: aapiProcedure
        .input(z.object({ department: z.string(), courseNumber: z.string() }))
        .query(async ({ input }): Promise<Course> => {
            for (const { courseId } of getRenamedCoursesIdentifiers(input.department, input.courseNumber)) {
                try {
                    return await aapiClient.courses.get(courseId);
                } catch (e) {
                    // AAPI returns 404 when the courseId does not exist — try predecessor names.
                    if (e instanceof AAPIError && e.status === 404) {
                        continue;
                    }

                    throw e;
                }
            }

            throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
        }),

    getMultiple: aapiProcedure
        .input(z.object({ courseIds: z.array(z.string()) }))
        .query(({ input }): Promise<CoursesBatchAPIResult['data']> => aapiClient.courses.getBatch(input.courseIds)),
});

export default courseRouter;

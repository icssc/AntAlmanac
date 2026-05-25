import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { getRenamedCoursesIdentifiers } from '$src/lib/courseRenames';
import type { Course, CoursesBatchAPIResult } from '@packages/anteater-api/types';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { router } from '../trpc';

const courseRouter = router({
    get: aapiProcedure
        .input(z.object({ department: z.string(), courseNumber: z.string() }))
        .query(async ({ input }): Promise<Course> => {
            for (const id of getRenamedCoursesIdentifiers(input.department, input.courseNumber).map(
                ({ department, courseNumber }) => department.replaceAll(' ', '') + courseNumber
            )) {
                try {
                    return await aapiClient.courses.get(id);
                } catch {
                    // course not found under this id — try predecessor
                }
            }

            throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
        }),

    getMultiple: aapiProcedure
        .input(z.object({ courseIds: z.array(z.string()) }))
        .query(({ input }): Promise<CoursesBatchAPIResult['data']> => aapiClient.courses.getBatch(input.courseIds)),
});

export default courseRouter;

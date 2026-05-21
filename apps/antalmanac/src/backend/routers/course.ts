import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { AAPIError } from '@packages/anteater-api/client';
import type { Course, CoursesBatchAPIResult } from '@packages/anteater-api/types';
import { z } from 'zod';

import { router } from '../trpc';

const courseRouter = router({
    get: aapiProcedure.input(z.object({ id: z.string() })).query(async ({ input }): Promise<Course | null> => {
        try {
            return await aapiClient.courses.get(input.id);
        } catch (e) {
            if (e instanceof AAPIError && e.status === 404) return null;
            throw e;
        }
    }),

    getMultiple: aapiProcedure
        .input(z.object({ courseIds: z.array(z.string()) }))
        .query(({ input }): Promise<CoursesBatchAPIResult['data']> => aapiClient.courses.getBatch(input.courseIds)),
});

export default courseRouter;

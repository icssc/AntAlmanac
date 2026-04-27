import { fetchAnteaterAPI } from '$src/backend/lib/helpers';
import type { CourseByIdAPIResult, CoursesBatchAPIResult } from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

const courseRouter = router({
    get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        const data = await fetchAnteaterAPI<CourseByIdAPIResult>(
            `https://anteaterapi.com/v2/rest/courses/${encodeURIComponent(input.id)}`,
            { errorType: 'trpc' }
        );
        return data.data;
    }),
    getMultiple: procedure.input(z.object({ courseIds: z.array(z.string()) })).query(async ({ input }) => {
        const data = await fetchAnteaterAPI<CoursesBatchAPIResult>(
            `https://anteaterapi.com/v2/rest/courses/batch?ids=${encodeURIComponent(input.courseIds.join(','))}`,
            { errorType: 'trpc' }
        );
        return data.data;
    }),
});

export default courseRouter;

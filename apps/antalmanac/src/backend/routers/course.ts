import type { CourseByIdAPIResult } from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

import { fetchAnteaterAPI } from '$src/backend/lib/helpers';

const courseRouter = router({
    get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        const data = await fetchAnteaterAPI<CourseByIdAPIResult>(
            `https://anteaterapi.com/v2/rest/courses/${encodeURIComponent(input.id)}`,
            { errorType: 'trpc' }
        );
        return data.data;
    }),
});

export default courseRouter;

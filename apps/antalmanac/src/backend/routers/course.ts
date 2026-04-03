import type { CourseByIdAPIResult } from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

import { fetchAnteaterAPIData } from '$src/backend/lib/helpers';

const courseRouter = router({
    get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        const data = await fetchAnteaterAPIData<CourseByIdAPIResult>(
            `https://anteaterapi.com/v2/rest/courses/${encodeURIComponent(input.id)}`
        );
        return data.ok ? data.data : null;
    }),
});

export default courseRouter;

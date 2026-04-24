import { fetchAnteaterAPI } from '$src/backend/lib/helpers';
import type { SyllabiAPIResult } from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

const syllabiRouter = router({
    get: procedure
        .input(
            z.object({
                courseId: z.string().min(1),
            })
        )
        .query(async ({ input }) => {
            const result = await fetchAnteaterAPI<SyllabiAPIResult>(
                `https://anteaterapi.com/v2/rest/websoc/syllabi?${new URLSearchParams({ courseId: input.courseId })}`,
                { errorType: 'trpc' }
            );
            return result.data ?? [];
        }),
});

export default syllabiRouter;

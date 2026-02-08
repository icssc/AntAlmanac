import { z } from 'zod';

import { fetchUserRoadmapsPeterPortal } from '../lib/peterportal';
import { procedure, router } from '../trpc';

const roadmapRouter = router({
    fetchUserRoadmapsPeterPortal: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        return await fetchUserRoadmapsPeterPortal(input.userId);
    }),
});

export default roadmapRouter;

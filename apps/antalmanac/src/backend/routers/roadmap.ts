import { removeGoogleIdPrefix } from '$lib/auth/authUtils';
import { z } from 'zod';

import { fetchUserPlannerRoadmaps } from '../lib/planner';
import { procedure, router } from '../trpc';

const roadmapRouter = router({
    fetchUserPlannerRoadmaps: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        return await fetchUserPlannerRoadmaps(removeGoogleIdPrefix(input.userId));
    }),
});

export default roadmapRouter;

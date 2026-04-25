import { removeGoogleIdPrefix } from '$lib/auth/authUtils';
import { protectedProcedure, router } from '$src/backend/trpc';

import { fetchUserPlannerRoadmaps } from '../lib/planner';

const roadmapRouter = router({
    fetchUserPlannerRoadmaps: protectedProcedure.query(async ({ ctx }) => {
        if (!ctx.googleId) {
            return [];
        }

        return await fetchUserPlannerRoadmaps(removeGoogleIdPrefix(ctx.googleId));
    }),
});

export default roadmapRouter;

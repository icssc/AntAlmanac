import { RDS } from '$src/backend/lib/rds';
import { protectedProcedure, router } from '$src/backend/trpc';
import { db } from '@packages/db';

import { fetchUserPlannerRoadmaps } from '../lib/planner';

const roadmapRouter = router({
    fetchUserPlannerRoadmaps: protectedProcedure.query(async ({ ctx }) => {
        const googleId = await RDS.getGoogleIdByUserId(db, ctx.userId);

        if (!googleId) {
            return [];
        }

        return await fetchUserPlannerRoadmaps(googleId);
    }),
});

export default roadmapRouter;

import { queryGetPlanners } from '$backend/planner/helpers/roadmap';
import { protectedProcedure, router } from '$backend/trpc';
import { type Roadmap } from '@packages/antalmanac-types';
import { db } from '@packages/db';
import { user } from '@packages/db/src/schema/planner';
import { eq } from 'drizzle-orm';

const roadmapRouter = router({
    /**
     * Returns the Planner roadmaps belonging to the signed-in user.
     *
     * Previously this proxied over HTTP to the standalone Planner service's
     * external API; the Planner now lives in this app, so we query its
     * tables directly.
     */
    fetchUserPlannerRoadmaps: protectedProcedure.query(async ({ ctx }): Promise<Roadmap[]> => {
        if (!ctx.userEmail) {
            return [];
        }

        const [matchedUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, ctx.userEmail));
        if (!matchedUser) {
            return [];
        }

        return await queryGetPlanners(eq(user.id, matchedUser.id));
    }),
});

export default roadmapRouter;

import { z } from 'zod';

import { procedure, router } from '../trpc';
import { fetchUserRoadmapsPeterPortal, flattenRoadmapCourses, roadmapSchema } from '../lib/peterportal';

const roadmapRouter = router({
    fetchUserRoadmapsPeterPortal: procedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ input }) => {
        return await fetchUserRoadmapsPeterPortal(input.userId);
        }),

    flattenRoadmapCourses: procedure
    .input(z.object({ roadmap: roadmapSchema }))
    .query(({ input }) => {
        return flattenRoadmapCourses(input.roadmap);
    }),
});

export default roadmapRouter;
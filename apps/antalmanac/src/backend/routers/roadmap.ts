import { z } from 'zod';

import { fetchUserRoadmapsPeterPortal, flattenRoadmapCourses, roadmapSchema } from '../lib/peterportal';
import { procedure, router } from '../trpc';

const roadmapRouter = router({
    fetchUserRoadmapsPeterPortal: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        return await fetchUserRoadmapsPeterPortal(input.userId);
    }),

    flattenRoadmapCourses: procedure.input(z.object({ roadmap: roadmapSchema })).query(({ input }) => {
        return flattenRoadmapCourses(input.roadmap);
    }),
});

export default roadmapRouter;

import { createPlannerContext } from '$backend/planner/context';
import { plannerAppRouter } from '$backend/planner/controllers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

/**
 * Serves the Planner tRPC router at the same URL the standalone Planner
 * service used (`/planner/api/trpc`), so the Planner frontend and external
 * integrations (e.g. `external.roadmaps.getByEmail`) work unchanged.
 */
const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/planner/api/trpc',
        req,
        router: plannerAppRouter,
        createContext: createPlannerContext,
    });

export { handler as GET, handler as POST };

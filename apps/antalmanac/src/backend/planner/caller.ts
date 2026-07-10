import 'server-only';
import { createPlannerServerContext } from '$backend/planner/context';
import { plannerAppRouter } from '$backend/planner/controllers';
import { createCallerFactory } from '$backend/planner/helpers/trpc';

const callerFactory = createCallerFactory(plannerAppRouter);

/**
 * Direct (in-process) caller for Planner procedures from React Server
 * Components. Replaces the standalone Planner's HTTP-based server-side
 * tRPC client — no network hop needed now that frontend and backend live
 * in the same Next.js app.
 */
export async function createPlannerCaller() {
    return callerFactory(await createPlannerServerContext());
}

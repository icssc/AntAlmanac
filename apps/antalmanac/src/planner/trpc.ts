// `import type` (not `import { type ... }`) so the backend module is fully
// erased from the client bundle under verbatimModuleSyntax.
import type { PlannerAppRouter } from '$backend/planner/controllers';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

/**
 * Client for the Planner tRPC router, served by this same Next.js app at
 * `/planner/api/trpc`.
 *
 * Server components should NOT use this — import `createPlannerCaller`
 * from `$backend/planner/caller` instead for a direct in-process call.
 */
const trpc = createTRPCClient<PlannerAppRouter>({
    links: [
        httpBatchLink({
            url: '/planner/api/trpc',
        }),
    ],
});

export default trpc;

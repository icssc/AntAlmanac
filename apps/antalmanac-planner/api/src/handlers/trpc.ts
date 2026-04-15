import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '../controllers';
import type { PlannerContext } from '../helpers/trpc';
import { getSessionFromRequest } from '../helpers/session';

function createFetchContext(req: Request): PlannerContext {
    return {
        session: getSessionFromRequest(req) ?? {},
        req,
    };
}

export const trpcHandler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/planner/trpc',
        req,
        router: appRouter,
        createContext: () => createFetchContext(req),
    });

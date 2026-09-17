import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '../controllers';
import { createContext } from '../helpers/trpc';

export const trpcRequestHandler = (request: Request) =>
    fetchRequestHandler({
        endpoint: '/planner/api/trpc',
        req: request,
        router: appRouter,
        createContext: () => createContext(request),
    });

export const GET = trpcRequestHandler;
export const POST = trpcRequestHandler;

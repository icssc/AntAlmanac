import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { createContext } from '$src/backend/context';
import appRouter from '$src/backend/routers';

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext,
    });

export { handler as GET, handler as POST };

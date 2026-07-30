// TODO: figure out context
//import { createContext } from '@antalmanac-planner/api/src/helpers/trpc';
import appRouter from '@antalmanac-planner/api/src/controllers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        //createContext,
    });

export { handler as GET, handler as POST };

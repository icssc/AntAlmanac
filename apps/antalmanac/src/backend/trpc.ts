import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

import type { Context } from './context';

const { procedure, router, _config, mergeRouters, middleware } = initTRPC.context<Context>().create({
    transformer: superjson,
});

export { procedure, router, _config, mergeRouters, middleware };

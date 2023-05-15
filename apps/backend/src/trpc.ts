import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { context } from './context';

const { procedure, router, _config, mergeRouters, middleware } = initTRPC.context<context>().create({
    transformer: superjson,
});

export { procedure, router, _config, mergeRouters, middleware };

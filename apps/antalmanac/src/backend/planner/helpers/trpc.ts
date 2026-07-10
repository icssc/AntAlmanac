import { TRPCError, initTRPC } from '@trpc/server';

import type { PlannerContext } from '../context';

/**
 * Separate tRPC instance for the Planner routers.
 *
 * Deliberately configured WITHOUT a transformer (unlike the scheduler's
 * superjson-based instance) so the wire format of `/planner/api/trpc` is
 * byte-compatible with the standalone Planner service it replaces — existing
 * clients and external integrations keep working unchanged.
 */
const trpc = initTRPC.context<PlannerContext>().create();
export const router = trpc.router;
export const publicProcedure = trpc.procedure;
export const createCallerFactory = trpc.createCallerFactory;

export const adminProcedure = publicProcedure.use(async (opts) => {
    if (!opts.ctx.session.isAdmin) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not an admin' });

    return opts.next(opts);
});

export const userProcedure = publicProcedure.use(async (opts) => {
    if (!opts.ctx.session.userId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not logged in' });

    return opts.next(opts);
});

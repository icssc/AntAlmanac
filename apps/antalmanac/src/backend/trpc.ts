import type { Context } from '$src/backend/context';
import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
    if (!ctx.userId || !ctx.sessionToken) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
        ctx: { ...ctx, userId: ctx.userId, sessionToken: ctx.sessionToken },
    });
});

export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const router = t.router;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;

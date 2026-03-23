import { TRPCError, initTRPC } from '@trpc/server';

export interface PlannerSession {
    userId?: number;
    userName?: string;
    isAdmin?: boolean;
}

export interface PlannerContext {
    session: PlannerSession;
    req: Request;
}

const trpc = initTRPC.context<PlannerContext>().create();
export const router = trpc.router;
export const publicProcedure = trpc.procedure;

export const adminProcedure = publicProcedure.use(async (opts) => {
    if (!opts.ctx.session.isAdmin) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not an admin' });

    return opts.next({
        ctx: { ...opts.ctx, session: { ...opts.ctx.session, isAdmin: true as const } },
    });
});

export const userProcedure = publicProcedure.use(async (opts) => {
    const userId = opts.ctx.session.userId;
    if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not logged in' });

    return opts.next({
        ctx: { ...opts.ctx, session: { ...opts.ctx.session, userId } },
    });
});

import { TRPCError, initTRPC } from '@trpc/server';
import { getSessionFromRequest } from '../next/session';
import type { SessionData } from '../types/session';

export const createContext = (req: Request) => ({
    req,
    session: getSessionFromRequest(req) as SessionData,
});

type Context = Awaited<ReturnType<typeof createContext>>;
const trpc = initTRPC.context<Context>().create();
export const router = trpc.router;
export const publicProcedure = trpc.procedure;

export const adminProcedure = publicProcedure.use(async (opts) => {
    if (!opts.ctx.session.isAdmin) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not an admin' });

    return opts.next(opts);
});

export const userProcedure = publicProcedure.use(async (opts) => {
    if (!opts.ctx.session.userId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not logged in' });

    return opts.next(opts);
});

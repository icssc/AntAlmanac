import * as trpcExpress from '@trpc/server/adapters/express';
import { TRPCError, initTRPC } from '@trpc/server';
import '../types/session'; // make eslint recognize session module augmentation

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({
  req,
  session: req.session,
  res,
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

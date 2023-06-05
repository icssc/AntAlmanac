import * as trpcExpress from '@trpc/server/adapters/express';
import { inferAsyncReturnType } from '@trpc/server';

export const createContext = async ({ req }: trpcExpress.CreateExpressContextOptions) => ({
    authId: (await (req as any).getUser())?.id,
});

export type context = inferAsyncReturnType<typeof createContext>;

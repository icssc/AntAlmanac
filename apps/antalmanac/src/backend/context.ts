import type { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const createContext = async (_opts: FetchCreateContextFnOptions) => {
    return {};
};

export type Context = inferAsyncReturnType<typeof createContext>;

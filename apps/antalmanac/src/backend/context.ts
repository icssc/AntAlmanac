import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    return {
        req: opts.req,
        resHeaders: opts.resHeaders,
    };
};

export type Context = inferAsyncReturnType<typeof createContext>;

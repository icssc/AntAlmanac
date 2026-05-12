import { auth } from '$lib/auth/auth';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { headers } from 'next/headers';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    const sessionData = await auth.api.getSession({ headers: await headers() });

    return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        userId: sessionData?.user.id,
        sessionToken: sessionData?.session?.token,
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

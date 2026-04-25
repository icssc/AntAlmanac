import { auth } from '$lib/auth/auth';
import { fetchGoogleAccount } from '$lib/auth/authActions';
import type { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { headers } from 'next/headers';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    const googleAccount = await fetchGoogleAccount();

    return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        userId: sessionData?.user.id,
        sessionToken: sessionData?.session?.token,
        googleId: googleAccount?.userId,
    };
};

export type Context = inferAsyncReturnType<typeof createContext>;

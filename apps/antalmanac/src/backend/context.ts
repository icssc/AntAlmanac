import { getUserIdBySessionToken } from '$src/backend/lib/rds/users';
import { db } from '@packages/db';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const SESSION_COOKIE_NAME = 'aa_session';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    const cookieHeader = opts.req.headers.get('cookie') ?? '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
    const sessionToken = match?.[1] || null;

    const userId = sessionToken ? await getUserIdBySessionToken(db, sessionToken) : null;

    return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        userId,
        sessionToken,
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

import { RDS } from '$src/backend/lib/rds';
import { db } from '@packages/db';
import type { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const SESSION_COOKIE_NAME = 'aa_session';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    const cookieHeader = opts.req.headers.get('cookie') ?? '';
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]*)`));
    const sessionToken = match?.[1] || null;

    let userId: string | null = null;
    if (sessionToken) {
        const session = await RDS.getCurrentSession(db, sessionToken);
        if (session && session.expires > new Date()) {
            userId = session.userId;
        }
    }

    return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        userId,
        sessionToken,
    };
};

export type Context = inferAsyncReturnType<typeof createContext>;

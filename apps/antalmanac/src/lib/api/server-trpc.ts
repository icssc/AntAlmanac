import 'server-only';
import { auth } from '$lib/auth/auth';
import type { Context } from '$src/backend/context';
import appRouter from '$src/backend/routers';
import { headers } from 'next/headers';

export async function createServerContext(): Promise<Context> {
    const sessionData = await auth.api.getSession({ headers: await headers() });

    return {
        req: new Request('https://antalmanac.com'),
        resHeaders: new Headers(),
        userId: sessionData?.user.id,
        userEmail: sessionData?.user.email,
        sessionToken: sessionData?.session?.token,
    };
}

export async function createServerCaller() {
    return appRouter.createCaller(await createServerContext());
}

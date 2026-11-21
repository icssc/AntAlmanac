import { auth } from '$lib/auth/auth';
/**
 * DEV/TEST ONLY: sign the browser into the local MCP test user, on both the scheduler
 * (better-auth) and the planner (signed `planner_session` cookie), so the local app shows the
 * same data the MCP tools read and write.
 *
 * Only active outside production with `MCP_DEV_BYPASS_AUTH=true` and `MCP_DEV_USER_ID` set.
 * The scheduler account is the scheduler user with the planner user's email (the same mapping
 * the MCP scheduler tools use). Visit `/api/dev-login?returnTo=/planner` to land on the planner.
 */
import { plannerDevLogin } from '@antalmanac-planner/api/src/next/devLogin';

function devUserId() {
    if (process.env.NODE_ENV === 'production' || process.env.MCP_DEV_BYPASS_AUTH !== 'true') return null;
    const id = Number(process.env.MCP_DEV_USER_ID);
    return Number.isInteger(id) && id > 0 ? id : null;
}

/** Same signing as better-call's `signCookieValue`: `${value}.${base64 HMAC-SHA256}`, URI-encoded. */
async function signCookieValue(value: string, secret: string) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
    return encodeURIComponent(`${value}.${Buffer.from(signature).toString('base64')}`);
}

export async function GET(request: Request) {
    const userId = devUserId();
    if (userId === null) return new Response('Not Found', { status: 404 });

    const returnTo = new URL(request.url).searchParams.get('returnTo');
    const location = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';

    const planner = await plannerDevLogin(request.url, userId);
    if (!planner) return new Response(`Planner user ${userId} not found`, { status: 500 });

    const ctx = await auth.$context;
    const scheduler = await ctx.internalAdapter.findUserByEmail(planner.email);
    if (!scheduler) return new Response(`No scheduler user with email ${planner.email}`, { status: 500 });

    const session = await ctx.internalAdapter.createSession(scheduler.user.id);
    const { sessionToken, sessionData } = ctx.authCookies;
    const schedulerCookie = [
        `${sessionToken.name}=${await signCookieValue(session.token, ctx.secret)}`,
        'Path=/',
        `Max-Age=${ctx.sessionConfig.expiresIn}`,
        'HttpOnly',
        'SameSite=Lax',
        ...(sessionToken.attributes.secure ? ['Secure'] : []),
    ].join('; ');

    const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
    for (const cookie of [
        schedulerCookie,
        // Drop any stale cached session so better-auth re-reads the new one from the DB.
        `${sessionData.name}=; Path=/; Max-Age=0`,
        ...planner.cookies,
    ]) {
        headers.append('Set-Cookie', cookie);
    }

    return new Response(null, { status: 302, headers });
}

import { auth } from '$lib/auth/auth';
import { getSignOutUrl } from '$lib/auth/authActions';
import { SSO_COOKIE_NAME, getSsoResponseCookieAttributes } from '$lib/ssoCookie';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Legacy Planner logout URL. Revokes the better-auth session, clears the
 * shared SSO hint cookie, and sends the user through the OIDC logout so
 * they are signed out of the issuer as well.
 */
export async function GET(request: NextRequest) {
    try {
        await auth.api.signOut({ headers: request.headers });
    } catch (error) {
        console.error('Error revoking session during Planner logout:', error);
    }

    const logoutUrl = await getSignOutUrl(`${request.nextUrl.origin}/planner`);
    const response = NextResponse.redirect(logoutUrl);

    response.cookies.set(SSO_COOKIE_NAME, '', {
        ...getSsoResponseCookieAttributes(request.nextUrl),
        maxAge: 0,
    });

    return response;
}

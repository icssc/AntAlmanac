import { NextResponse } from 'next/server';

import { sessionClearCookieHeader } from '../../helpers/session';

export async function logoutHandler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const isLocalhost = url.hostname === 'localhost';

    const domain = isLocalhost ? '' : ' Domain=antalmanac.com;';
    const clearSharedSSO = `icssc_logged_in=; Path=/;${domain} Max-Age=0`;
    const clearUserCookie = `user=; Path=/; Max-Age=0`;

    const logoutUrl = new URL(`${process.env.OIDC_ISSUER_URL}/logout`);
    logoutUrl.searchParams.set('post_logout_redirect_uri', `${process.env.PRODUCTION_DOMAIN}/planner`);

    const response = NextResponse.redirect(logoutUrl.toString());
    response.headers.append('Set-Cookie', sessionClearCookieHeader());
    response.headers.append('Set-Cookie', clearSharedSSO);
    response.headers.append('Set-Cookie', clearUserCookie);

    return response;
}

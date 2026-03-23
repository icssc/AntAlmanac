import { NextResponse } from 'next/server';
import { CodeChallengeMethod, generateCodeVerifier, generateState } from 'arctic';

import { createOIDCClient } from '../../config/oidc';

const OAUTH_COOKIE_MAX_AGE = 600; // 10 minutes

function oauthCookieOptions(isLocalhost: boolean): string {
    const secure = isLocalhost ? '' : ' Secure;';
    const sameSite = isLocalhost ? 'Lax' : 'None';
    return `Path=/; HttpOnly;${secure} SameSite=${sameSite}; Max-Age=${OAUTH_COOKIE_MAX_AGE}`;
}

export async function googleAuthHandler(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const isLocalhost = url.hostname === 'localhost';
        const oidcClient = createOIDCClient();
        const state = generateState();
        const codeVerifier = generateCodeVerifier();

        const authUrl = oidcClient.createAuthorizationURLWithPKCE(
            `${process.env.OIDC_ISSUER_URL}/authorize`,
            state,
            CodeChallengeMethod.S256,
            codeVerifier,
            ['openid', 'profile', 'email'],
        );

        if (url.searchParams.get('prompt') === 'none') {
            authUrl.searchParams.set('prompt', 'none');
        }

        const referer = req.headers.get('referer') ?? '/planner';
        const opts = oauthCookieOptions(isLocalhost);

        const response = NextResponse.redirect(authUrl.toString());
        response.headers.append('Set-Cookie', `planner_oauth_state=${state}; ${opts}`);
        response.headers.append('Set-Cookie', `planner_oauth_verifier=${codeVerifier}; ${opts}`);
        response.headers.append('Set-Cookie', `planner_oauth_return_to=${encodeURIComponent(referer)}; ${opts}`);

        return response;
    } catch (error) {
        console.error('Error initiating authentication:', error);
        return NextResponse.redirect(new URL('/planner?error=auth_failed', req.url));
    }
}

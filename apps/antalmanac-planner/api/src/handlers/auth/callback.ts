import { NextResponse } from 'next/server';

import { createOIDCClient } from '../../config/oidc';
import { SESSION_LENGTH } from '../../config/constants';
import { db } from '../../db';
import { user } from '../../db/schema';
import { sessionSetCookieHeader, type PlannerSessionData } from '../../helpers/session';

interface OIDCUserInfo {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
}

function parseCookies(req: Request): Record<string, string> {
    const header = req.headers.get('cookie') ?? '';
    return Object.fromEntries(
        header
            .split('; ')
            .filter((c) => c.includes('='))
            .map((c) => {
                const [key, ...v] = c.split('=');
                return [key, v.join('=')];
            }),
    );
}

function clearOAuthCookieHeader(name: string, isLocalhost: boolean): string {
    const secure = isLocalhost ? '' : ' Secure;';
    const sameSite = isLocalhost ? 'Lax' : 'None';
    return `${name}=; Path=/; HttpOnly;${secure} SameSite=${sameSite}; Max-Age=0`;
}

function sharedSSOCookieHeader(isLocalhost: boolean): string {
    const domain = isLocalhost ? '' : ' Domain=antalmanac.com;';
    const secure = isLocalhost ? '' : ' Secure;';
    return `icssc_logged_in=1; Path=/;${domain}${secure} SameSite=Lax; Max-Age=${SESSION_LENGTH / 1000}`;
}

function clearSharedSSOCookieHeader(isLocalhost: boolean): string {
    const domain = isLocalhost ? '' : ' Domain=antalmanac.com;';
    return `icssc_logged_in=; Path=/;${domain} Max-Age=0`;
}

export async function googleCallbackHandler(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const isLocalhost = url.hostname === 'localhost';
    const cookies = parseCookies(req);

    const storedState = cookies['planner_oauth_state'] ?? null;
    const codeVerifier = cookies['planner_oauth_verifier'] ?? null;
    const returnTo = decodeURIComponent(cookies['planner_oauth_return_to'] ?? '/planner');

    const clearCookies = (response: NextResponse) => {
        response.headers.append('Set-Cookie', clearOAuthCookieHeader('planner_oauth_state', isLocalhost));
        response.headers.append('Set-Cookie', clearOAuthCookieHeader('planner_oauth_verifier', isLocalhost));
        response.headers.append('Set-Cookie', clearOAuthCookieHeader('planner_oauth_return_to', isLocalhost));
        return response;
    };

    if (url.searchParams.get('error') === 'login_required') {
        const response = NextResponse.redirect(new URL(returnTo, req.url));
        clearCookies(response);
        response.headers.append('Set-Cookie', clearSharedSSOCookieHeader(isLocalhost));
        return response;
    }

    try {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');

        if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
            console.error('Invalid OAuth state or code');
            return clearCookies(NextResponse.redirect(new URL('/planner?error=invalid_state', req.url)));
        }

        const oidcClient = createOIDCClient();
        const tokens = await oidcClient.validateAuthorizationCode(
            `${process.env.OIDC_ISSUER_URL}/token`,
            code,
            codeVerifier,
        );

        const userInfoResponse = await fetch(`${process.env.OIDC_ISSUER_URL}/userinfo`, {
            headers: { Authorization: `Bearer ${tokens.accessToken()}` },
        });

        if (!userInfoResponse.ok) {
            console.error('Failed to fetch user info:', userInfoResponse.statusText);
            return clearCookies(NextResponse.redirect(new URL('/planner?error=userinfo_failed', req.url)));
        }

        const userInfo: OIDCUserInfo = await userInfoResponse.json();

        if (!userInfo.email) {
            console.error('Email not provided by OIDC provider');
            return clearCookies(NextResponse.redirect(new URL('/planner?error=no_email', req.url)));
        }

        const userData = await db
            .insert(user)
            .values({
                googleId: userInfo.sub,
                name: userInfo.name ?? '',
                email: userInfo.email,
                picture: userInfo.picture ?? '',
            })
            .onConflictDoUpdate({
                target: [user.email],
                set: {
                    googleId: userInfo.sub,
                    name: userInfo.name ?? '',
                    email: userInfo.email,
                    picture: userInfo.picture ?? '',
                },
            })
            .returning();

        const allowedUsers: string[] = JSON.parse(process.env.ADMIN_EMAILS ?? '[]');
        const sessionData: PlannerSessionData = {
            userId: userData[0].id,
            userName: userData[0].name,
            isAdmin: allowedUsers.includes(userData[0].email),
        };

        const response = NextResponse.redirect(new URL(returnTo, req.url));
        clearCookies(response);
        response.headers.append('Set-Cookie', sessionSetCookieHeader(sessionData, isLocalhost));
        response.headers.append('Set-Cookie', sharedSSOCookieHeader(isLocalhost));

        return response;
    } catch (error) {
        console.error('Error in OIDC callback:', error);
        return clearCookies(NextResponse.redirect(new URL('/planner?error=callback_failed', req.url)));
    }
}

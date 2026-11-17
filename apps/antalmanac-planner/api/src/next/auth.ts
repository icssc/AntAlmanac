import { CodeChallengeMethod, generateCodeVerifier, generateState } from 'arctic';

import { createOIDCClient } from '../config/oidc';
import { isNativeIosApp } from '../helpers/platform';
import { upsertOidcUser, type OidcUserInfo } from '../helpers/users';
import {
    appendCookies,
    clearSessionCookie,
    createLoggedInCookie,
    createSessionCookie,
    getSessionFromRequest,
} from './session';

function responseWithCookies(location: string, cookies: string[]) {
    const headers = new Headers({ Location: location });
    appendCookies(headers, cookies);
    return new Response(null, { status: 302, headers });
}

function domainSpecificAttributes(requestUrl: string) {
    const domain = new URL(requestUrl).hostname === 'localhost' ? undefined : 'antalmanac.com';
    const secure = new URL(requestUrl).hostname === 'localhost' ? [] : ['Secure'];
    const domainAttr = domain ? [`Domain=${domain}`] : [];

    return [...secure, ...domainAttr];
}

function clearSharedCookie(requestUrl: string) {
    const attributes = ['icssc_logged_in=', 'Path=/', 'Max-Age=0', ...domainSpecificAttributes(requestUrl)];
    return attributes.join('; ');
}

function clearUserCookie(requestUrl: string) {
    const attributes = ['user=', 'Path=/', 'Max-Age=0', 'SameSite=Lax', ...domainSpecificAttributes(requestUrl)];
    return attributes.join('; ');
}

function buildRedirectUriFromRequest(request: Request, native = false) {
    const origin = process.env.PRODUCTION_DOMAIN ?? new URL(request.url).origin;
    const path = native ? '/planner/api/users/auth/google/callback/native' : '/planner/api/users/auth/google/callback';
    return new URL(path, origin).toString();
}

async function successLogin(userInfo: OidcUserInfo, request: Request) {
    const userData = await upsertOidcUser(userInfo);

    const currentSession = getSessionFromRequest(request);
    const allowedUsers = JSON.parse(process.env.ADMIN_EMAILS ?? '[]');
    const nextSession = {
        ...currentSession,
        userId: userData.id,
        userName: userData.name,
        isAdmin: allowedUsers.includes(userData.email),
    };
    delete nextSession.oauthState;
    delete nextSession.codeVerifier;
    delete nextSession.oauthRedirectUri;
    delete nextSession.returnTo;

    const returnTo = currentSession.returnTo ?? '/planner';
    return responseWithCookies(returnTo, [
        createSessionCookie(request.url, nextSession),
        createLoggedInCookie(request.url),
    ]);
}

async function handleGoogleAuth(request: Request) {
    const redirectUri = buildRedirectUriFromRequest(request, isNativeIosApp(request));
    const oidcClient = createOIDCClient(redirectUri);
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const currentSession = getSessionFromRequest(request);

    const nextSession = {
        ...currentSession,
        oauthState: state,
        codeVerifier,
        oauthRedirectUri: redirectUri,
        returnTo: request.headers.get('referer') ?? '/planner',
    };

    const authUrl = oidcClient.createAuthorizationURLWithPKCE(
        `${process.env.OIDC_ISSUER_URL}/authorize`,
        state,
        CodeChallengeMethod.S256,
        codeVerifier,
        ['openid', 'profile', 'email']
    );

    const provider = new URL(request.url).searchParams.get('provider');
    if (provider === 'apple' || provider === 'google') {
        authUrl.searchParams.set('provider', provider);
    }

    if (new URL(request.url).searchParams.get('prompt') === 'none') {
        authUrl.searchParams.set('prompt', 'none');
    }

    return responseWithCookies(authUrl.toString(), [createSessionCookie(request.url, nextSession)]);
}

async function handleGoogleCallback(request: Request, native = false) {
    const url = new URL(request.url);
    const currentSession = getSessionFromRequest(request);
    const returnTo = currentSession.returnTo ?? '/planner';

    if (url.searchParams.get('error') === 'login_required') {
        return responseWithCookies(returnTo, [clearSharedCookie(request.url), clearSessionCookie(request.url)]);
    }

    const code = url.searchParams.get('code') ?? undefined;
    const state = url.searchParams.get('state') ?? undefined;
    const storedState = currentSession.oauthState;
    const codeVerifier = currentSession.codeVerifier;

    if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
        return responseWithCookies(new URL('/?error=invalid_state', new URL(request.url).origin).toString(), [
            clearSessionCookie(request.url),
        ]);
    }

    const redirectUri = currentSession.oauthRedirectUri ?? buildRedirectUriFromRequest(request, native);
    const oidcClient = createOIDCClient(redirectUri);

    const tokens = await oidcClient.validateAuthorizationCode(
        `${process.env.OIDC_ISSUER_URL}/token`,
        code,
        codeVerifier
    );

    const userInfoEndpoint = `${process.env.OIDC_ISSUER_URL}/userinfo`;
    const userInfoResponse = await fetch(userInfoEndpoint, {
        headers: {
            Authorization: `Bearer ${tokens.accessToken()}`,
        },
    });

    if (!userInfoResponse.ok) {
        return responseWithCookies(new URL('/?error=userinfo_failed', new URL(request.url).origin).toString(), [
            clearSessionCookie(request.url),
        ]);
    }

    const userInfo = (await userInfoResponse.json()) as OidcUserInfo;

    if (!userInfo.email) {
        return responseWithCookies(new URL('/?error=no_email', new URL(request.url).origin).toString(), [
            clearSessionCookie(request.url),
        ]);
    }

    return successLogin(userInfo, request);
}

function handleLogout(request: Request) {
    const logoutUrl = new URL(`${process.env.OIDC_ISSUER_URL}/logout`);
    logoutUrl.searchParams.set('post_logout_redirect_uri', `${new URL(request.url).origin}/planner`);
    return responseWithCookies(logoutUrl.toString(), [
        clearUserCookie(request.url),
        clearSharedCookie(request.url),
        clearSessionCookie(request.url),
    ]);
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.endsWith('/google')) {
        return handleGoogleAuth(request);
    }

    if (path.endsWith('/google/callback/native')) {
        return handleGoogleCallback(request, true);
    }

    if (path.endsWith('/google/callback')) {
        return handleGoogleCallback(request, false);
    }

    if (path.endsWith('/logout')) {
        return handleLogout(request);
    }

    return new Response('Not Found', { status: 404 });
}

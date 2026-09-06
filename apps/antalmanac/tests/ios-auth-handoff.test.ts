import { describe, expect, test } from 'vitest';

/**
 * Mirrors `shouldHandOffOidcToASWebAuthenticationSession` and
 * `authHandoffCallback` in apps/ios/src/AntAlmanac/Settings.swift so the
 * Safari vs WKWebView cookie-jar contract is executable without Xcode.
 */
function shouldHandOffOidcToASWebAuthenticationSession(urlString: string): boolean {
    const url = new URL(urlString);
    if (!url.hostname.includes('auth.icssc.club')) {
        return false;
    }
    if (url.pathname.startsWith('/logout')) {
        return true;
    }
    if (!url.pathname.startsWith('/authorize')) {
        return false;
    }
    return url.searchParams.get('prompt') !== 'none';
}

function authHandoffCallback(urlString: string): { host: string; path: string } {
    const url = new URL(urlString);
    const isLogout = url.pathname.startsWith('/logout');
    const paramName = isLogout ? 'post_logout_redirect_uri' : 'redirect_uri';
    const redirect = url.searchParams.get(paramName);
    const redirectURI = redirect ? new URL(redirect) : null;
    const host = redirectURI?.hostname ?? 'antalmanac.com';
    const defaultPath = isLogout ? '/' : '/api/auth/oauth2/callback/icssc';
    const rawPath = redirectURI?.pathname ?? defaultPath;
    const path = rawPath === '' ? '/' : rawPath;
    return { host, path };
}

describe('iOS ASW handoff URL contract', () => {
    test('hands off interactive authorize and logout, not silent SSO', () => {
        expect(
            shouldHandOffOidcToASWebAuthenticationSession(
                'https://auth.icssc.club/authorize?redirect_uri=https://antalmanac.com/api/auth/oauth2/callback/icssc'
            )
        ).toBe(true);
        expect(
            shouldHandOffOidcToASWebAuthenticationSession(
                'https://auth.icssc.club/logout?post_logout_redirect_uri=https://antalmanac.com'
            )
        ).toBe(true);
        expect(
            shouldHandOffOidcToASWebAuthenticationSession(
                'https://auth.icssc.club/authorize?prompt=none&redirect_uri=https://antalmanac.com/api/auth/oauth2/callback/icssc'
            )
        ).toBe(false);
        expect(
            shouldHandOffOidcToASWebAuthenticationSession('https://auth.icssc.club/.well-known/openid-configuration')
        ).toBe(false);
    });

    test('logout callback uses post_logout_redirect_uri origin path', () => {
        expect(
            authHandoffCallback('https://auth.icssc.club/logout?post_logout_redirect_uri=https://antalmanac.com')
        ).toStrictEqual({ host: 'antalmanac.com', path: '/' });
        expect(
            authHandoffCallback(
                'https://auth.icssc.club/authorize?redirect_uri=https://antalmanac.com/api/auth/oauth2/callback/icssc'
            )
        ).toStrictEqual({ host: 'antalmanac.com', path: '/api/auth/oauth2/callback/icssc' });
    });
});

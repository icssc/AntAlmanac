/**
 * Shared SSO cookie used to signal across apps on antalmanac.com
 * that the user has an active ICSSC auth session.
 *
 * This is a non-HttpOnly hint cookie readable by both AntAlmanac (/)
 * and PeterPortal (/planner). It is NOT a session token.
 */

import { NextRequest, NextResponse } from 'next/server';

type NextResponseCookie = Parameters<NextResponse['cookies']['set']>[2];
type NextURL = NextRequest['nextUrl'];

export const SSO_COOKIE_NAME = 'icssc_logged_in';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * When changing this function, also change {@link getCookieAttributes}
 */
export function getSsoResponseCookieAttributes(nextUrl: NextURL): Partial<NextResponseCookie> {
    const isLocalhost = nextUrl.hostname === 'localhost';
    const domain = isLocalhost ? '' : 'antalmanac.com';
    return {
        path: '/',
        sameSite: 'lax',
        domain: domain,
        secure: !isLocalhost,
    };
}

/**
 * When changing this function, also change {@link getSsoResponseCookieAttributes}
 */
function getCookieAttributes(): string {
    const isLocalhost = window.location.hostname === 'localhost';
    const domain = isLocalhost ? '' : 'domain=antalmanac.com; ';
    const secure = isLocalhost ? '' : 'secure; ';
    return `path=/; ${domain}${secure}samesite=lax`;
}

export function setSsoCookie() {
    document.cookie = `${SSO_COOKIE_NAME}=1; ${getCookieAttributes()}; max-age=${MAX_AGE_SECONDS}`;
}

export function clearSsoCookie() {
    document.cookie = `${SSO_COOKIE_NAME}=; ${getCookieAttributes()}; max-age=0`;
}

export function hasSsoCookie(): boolean {
    return document.cookie.includes(`${SSO_COOKIE_NAME}=1`);
}

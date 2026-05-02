/**
 * Shared SSO cookie used to signal across apps on antalmanac.com
 * that the user has an active ICSSC auth session.
 *
 * This is a non-HttpOnly hint cookie readable by both AntAlmanac (/)
 * and PeterPortal (/planner). It is NOT a session token.
 */

const COOKIE_NAME = 'icssc_logged_in';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function getCookieAttributes(): string {
    const isLocalhost = window.location.hostname === 'localhost';
    const domain = isLocalhost ? '' : 'domain=antalmanac.com; ';
    const secure = isLocalhost ? '' : 'secure; ';
    return `path=/; ${domain}${secure}samesite=lax`;
}

export function setSsoCookie() {
    document.cookie = `${COOKIE_NAME}=1; ${getCookieAttributes()}; max-age=${MAX_AGE_SECONDS}`;
}

export function clearSsoCookie() {
    document.cookie = `${COOKIE_NAME}=; ${getCookieAttributes()}; max-age=0`;
}

export function hasSsoCookie(): boolean {
    return document.cookie.includes(`${COOKIE_NAME}=1`);
}

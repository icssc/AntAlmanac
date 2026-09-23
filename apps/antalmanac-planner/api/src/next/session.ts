import crypto from 'node:crypto';

import type { SessionData } from '../types/session';

const SESSION_COOKIE_NAME = 'planner_session';
const LOGGED_IN_COOKIE_NAME = 'icssc_logged_in';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret() {
    const secret = process.env.PLANNER_SESSION_SECRET;

    if (!secret) {
        throw new Error('PLANNER_SESSION_SECRET must be defined');
    }

    return secret;
}

function base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
    return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value: string) {
    return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url');
}

function serializeSession(session: SessionData) {
    const payload = base64UrlEncode(JSON.stringify(session));
    return `${payload}.${sign(payload)}`;
}

function deserializeSession(value: string): SessionData | null {
    const separatorIndex = value.lastIndexOf('.');

    if (separatorIndex < 0) {
        return null;
    }

    const payload = value.slice(0, separatorIndex);
    const signature = value.slice(separatorIndex + 1);

    if (sign(payload) !== signature) {
        return null;
    }

    try {
        return JSON.parse(base64UrlDecode(payload)) as SessionData;
    } catch {
        return null;
    }
}

type CookieOptions = {
    requestUrl: string;
    maxAge?: number;
    value?: string;
    httpOnly?: boolean;
    sameSite?: 'Lax';
    secure?: boolean;
};

function parseCookies(cookieHeader: string | null) {
    return Object.fromEntries(
        (cookieHeader ?? '')
            .split(';')
            .map((cookie) => cookie.trim())
            .filter(Boolean)
            .map((cookie) => {
                const separatorIndex = cookie.indexOf('=');
                if (separatorIndex < 0) {
                    return [cookie, ''];
                }
                return [cookie.slice(0, separatorIndex), cookie.slice(separatorIndex + 1)];
            })
    );
}

function isLocalhost(requestUrl: string) {
    return new URL(requestUrl).hostname === 'localhost';
}

function cookieDomain(requestUrl: string) {
    return isLocalhost(requestUrl) ? undefined : 'antalmanac.com';
}

function createCookie(name: string, options: CookieOptions) {
    const domain = cookieDomain(options.requestUrl);
    const attributes = [
        `${name}=${options.value ?? ''}`,
        'Path=/',
        ...(options.maxAge !== undefined ? [`Max-Age=${options.maxAge}`] : []),
    ];

    if (options.httpOnly) attributes.push('HttpOnly');
    if (options.sameSite) attributes.push(`SameSite=${options.sameSite}`);
    if (options.secure ?? !isLocalhost(options.requestUrl)) attributes.push('Secure');
    if (domain) attributes.push(`Domain=${domain}`);

    return attributes.join('; ');
}

export function getSessionFromRequest(request: Request): SessionData {
    const cookies = parseCookies(request.headers.get('cookie'));
    const rawSession = cookies[SESSION_COOKIE_NAME];

    if (!rawSession) {
        return {};
    }

    return deserializeSession(rawSession) ?? {};
}

export function createSessionCookie(requestUrl: string, session: SessionData) {
    return createCookie(SESSION_COOKIE_NAME, {
        requestUrl,
        value: serializeSession(session),
        maxAge: COOKIE_MAX_AGE_SECONDS,
        httpOnly: true,
        sameSite: 'Lax',
    });
}

export function clearSessionCookie(requestUrl: string) {
    return createCookie(SESSION_COOKIE_NAME, {
        requestUrl,
        maxAge: 0,
        httpOnly: true,
        sameSite: 'Lax',
    });
}

export function createLoggedInCookie(requestUrl: string) {
    return createCookie(LOGGED_IN_COOKIE_NAME, {
        requestUrl,
        value: '1',
        maxAge: COOKIE_MAX_AGE_SECONDS,
        sameSite: 'Lax',
    });
}

export function clearLoggedInCookie(requestUrl: string) {
    return createCookie(LOGGED_IN_COOKIE_NAME, {
        requestUrl,
        maxAge: 0,
        sameSite: 'Lax',
    });
}

export function appendCookies(headers: Headers, cookies: string[]) {
    for (const cookie of cookies) {
        headers.append('Set-Cookie', cookie);
    }
}

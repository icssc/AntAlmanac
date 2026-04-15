import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET ?? 'secret';
const COOKIE_NAME = 'planner_session';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface PlannerSessionData {
    userId: number;
    userName: string;
    isAdmin: boolean;
}

function sign(payload: string): string {
    return crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
}

export function encodeSession(data: PlannerSessionData): string {
    const json = Buffer.from(JSON.stringify(data)).toString('base64url');
    return `${json}.${sign(json)}`;
}

export function decodeSession(cookie: string): PlannerSessionData | null {
    const [json, sig] = cookie.split('.');
    if (!json || !sig || sign(json) !== sig) return null;
    try {
        return JSON.parse(Buffer.from(json, 'base64url').toString());
    } catch {
        return null;
    }
}

/**
 * Reads the planner session from the request's cookies.
 * Works with any standard Request object (Fetch API).
 */
export function getSessionFromRequest(req: Request): PlannerSessionData | null {
    const cookieHeader = req.headers.get('cookie') ?? '';
    const match = cookieHeader.split('; ').find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    const value = match.slice(COOKIE_NAME.length + 1);
    return decodeSession(value);
}

export function sessionSetCookieHeader(data: PlannerSessionData, isLocalhost: boolean): string {
    const secure = isLocalhost ? '' : ' Secure;';
    return `${COOKIE_NAME}=${encodeSession(data)}; Path=/; HttpOnly; SameSite=Lax;${secure} Max-Age=${MAX_AGE_SECONDS}`;
}

export function sessionClearCookieHeader(): string {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`;
}

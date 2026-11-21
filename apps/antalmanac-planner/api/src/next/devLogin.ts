import { eq } from 'drizzle-orm';

import { db } from '../db';
import { user } from '../db/schema';
import { createLoggedInCookie, createSessionCookie } from './session';

/**
 * DEV/TEST ONLY: planner session cookies for the MCP test user (`MCP_DEV_USER_ID`).
 * Used by the app's `/api/dev-login` route; returns null if the user doesn't exist.
 */
export async function plannerDevLogin(requestUrl: string, userId: number) {
    const [planner] = await db.select().from(user).where(eq(user.id, userId));
    if (!planner) return null;

    const admins: string[] = JSON.parse(process.env.ADMIN_EMAILS ?? '[]');
    return {
        email: planner.email,
        cookies: [
            createSessionCookie(requestUrl, {
                userId: planner.id,
                userName: planner.name,
                isAdmin: admins.includes(planner.email),
            }),
            createLoggedInCookie(requestUrl),
        ],
    };
}

import { auth } from '$lib/auth/auth';
import { db } from '@packages/db';
import { user } from '@packages/db/src/schema/planner';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

/**
 * Session shape the ported Planner controllers expect.
 *
 * The standalone Planner used express-session; the merged app derives an
 * equivalent object from the better-auth session on every request.
 */
export interface PlannerSession {
    /** Planner `user.id` (integer identity column), NOT the better-auth user id. */
    userId?: number;
    userName?: string;
    isAdmin?: boolean;
}

function getAdminEmails(): string[] {
    try {
        return JSON.parse(process.env.ADMIN_EMAILS ?? '[]');
    } catch {
        return [];
    }
}

/**
 * Bridges a better-auth session to a Planner `user` row.
 *
 * The standalone Planner provisioned its `user` rows during its own OAuth
 * callback. The merged app signs users in with better-auth (same ICSSC OIDC
 * issuer), so the Planner row is found — or created — by email on first use.
 */
async function getPlannerSession(): Promise<PlannerSession> {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    const email = sessionData?.user.email;
    if (!email) {
        return {};
    }

    let [plannerUser] = await db.select().from(user).where(eq(user.email, email));
    if (!plannerUser) {
        [plannerUser] = await db
            .insert(user)
            .values({
                name: sessionData.user.name ?? '',
                email,
                picture: sessionData.user.image ?? '',
            })
            .onConflictDoNothing({ target: user.email })
            .returning();
        if (!plannerUser) {
            // Lost a concurrent insert race; the row exists now.
            [plannerUser] = await db.select().from(user).where(eq(user.email, email));
        }
    }

    return {
        userId: plannerUser?.id,
        userName: plannerUser?.name,
        isAdmin: getAdminEmails().includes(email),
    };
}

export const createPlannerContext = async (opts: FetchCreateContextFnOptions) => {
    return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        /** Authorization header, used by the external (API-key) router. */
        authorization: opts.req.headers.get('authorization') ?? undefined,
        session: await getPlannerSession(),
    };
};

export type PlannerContext = Awaited<ReturnType<typeof createPlannerContext>>;

/**
 * Context for calling Planner procedures from React Server Components,
 * where there is no HTTP request targeted at the tRPC endpoint.
 */
export const createPlannerServerContext = async (): Promise<PlannerContext> => {
    return {
        req: undefined as unknown as Request,
        resHeaders: new Headers(),
        authorization: undefined,
        session: await getPlannerSession(),
    };
};

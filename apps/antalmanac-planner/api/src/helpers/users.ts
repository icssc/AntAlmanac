/**
 * Shared helpers for resolving an OIDC identity to a local user record.
 *
 * Used by both the interactive web/native login (`next/auth.ts`) and the MCP
 * OAuth flow (`controllers/mcp/`), so the two paths create/link accounts identically.
 * @module
 */

import { eq } from 'drizzle-orm';

import { db } from '../db';
import { account, user, type providerEnum } from '../db/schema';

type Provider = (typeof providerEnum.enumValues)[number];

export interface OidcUserInfo {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
}

export function providerFromSub(sub: string): Provider {
    const prefix = sub.split('_')[0];
    switch (prefix) {
        case 'google':
            return 'GOOGLE';
        case 'apple':
            return 'APPLE';
        default:
            throw new Error(`Unknown provider prefix in sub: ${sub}`);
    }
}

/**
 * Find-or-create a user for the given OIDC identity and link the provider account.
 *
 * Matches on email (the unique key). For an existing user, refreshes name/picture when
 * the provider supplies them. Returns the persisted user row.
 */
export async function upsertOidcUser(userInfo: OidcUserInfo) {
    const { sub, email, name, picture } = userInfo;
    const provider = providerFromSub(sub);

    /**
     * TODO: Some legacy user accounts do not have an email associated, but do have a google id.
     *
     * We would like to handle this case gracefully, by handling conflicts on google id OR email.
     * At the time of writing (2025-12-07), Drizzle does not have such a mechanism.
     * Possible methods include updating a user based on google id, then manually inserting if no such user exists,
     * or using a raw SQL query
     */
    return db.transaction(async (tx) => {
        let [dbUser] = await tx.select().from(user).where(eq(user.email, email));

        if (dbUser) {
            await tx
                .update(user)
                .set({
                    name: name || dbUser.name,
                    picture: picture || dbUser.picture,
                })
                .where(eq(user.id, dbUser.id));
            dbUser = { ...dbUser, name: name || dbUser.name };
        } else {
            [dbUser] = await tx
                .insert(user)
                .values({
                    name: name ?? '',
                    email,
                    picture: picture ?? '',
                })
                .returning();
        }

        await tx
            .insert(account)
            .values({
                userId: dbUser.id,
                provider,
                providerAccountId: sub,
            })
            .onConflictDoNothing();

        return dbUser;
    });
}

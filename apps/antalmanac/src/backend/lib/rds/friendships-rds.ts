import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import { friendships, users } from '@packages/db/src/schema';
import { and, eq, ExtractTablesWithRelations, ne, or } from 'drizzle-orm';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';

type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

export class FriendshipsRDS {
    /**
     * Returns all friendship rows between two users regardless of direction.
     * There can be up to two rows (e.g. DECLINED + BLOCKED after a block).
     */
    static async getFriendshipsBetween(db: DatabaseOrTransaction, userIdA: string, userIdB: string) {
        return db
            .select()
            .from(friendships)
            .where(
                or(
                    and(eq(friendships.requesterId, userIdA), eq(friendships.addresseeId, userIdB)),
                    and(eq(friendships.requesterId, userIdB), eq(friendships.addresseeId, userIdA))
                )
            );
    }

    /**
     * Inserts a PENDING friend request from requesterId to addresseeId.
     * Does nothing on conflict — a DECLINED row must not be overwritten back to PENDING.
     */
    static async insertFriendRequest(db: DatabaseOrTransaction, requesterId: string, addresseeId: string) {
        return db
            .insert(friendships)
            .values({ requesterId, addresseeId, status: 'PENDING' })
            .onConflictDoNothing()
            .returning();
    }

    /**
     * Updates a PENDING friendship to ACCEPTED.
     */
    static async acceptFriendRequest(db: DatabaseOrTransaction, requesterId: string, addresseeId: string) {
        return db
            .update(friendships)
            .set({ status: 'ACCEPTED', updatedAt: new Date() })
            .where(
                and(
                    eq(friendships.requesterId, requesterId),
                    eq(friendships.addresseeId, addresseeId),
                    eq(friendships.status, 'PENDING')
                )
            )
            .returning();
    }

    /**
     * Returns accepted friends where the given user sent the request.
     */
    static async getFriendshipsSent(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.addresseeId, users.id))
            .where(and(eq(friendships.requesterId, userId), eq(friendships.status, 'ACCEPTED')));
    }

    /**
     * Returns accepted friends where the given user received the request.
     */
    static async getFriendshipsReceived(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.requesterId, users.id))
            .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'ACCEPTED')));
    }

    /**
     * Returns all accepted friends for the given user as an array of user objects.
     */
    static async getFriends(db: DatabaseOrTransaction, userId: string) {
        const [sent, received] = await Promise.all([
            FriendshipsRDS.getFriendshipsSent(db, userId),
            FriendshipsRDS.getFriendshipsReceived(db, userId),
        ]);
        return [...sent, ...received];
    }

    /**
     * Returns true if an ACCEPTED friendship exists between the two users in either direction.
     */
    static async areFriends(db: DatabaseOrTransaction, viewerId: string, targetUserId: string): Promise<boolean> {
        const [row] = await db
            .select({ id: friendships.requesterId })
            .from(friendships)
            .where(
                and(
                    eq(friendships.status, 'ACCEPTED'),
                    or(
                        and(eq(friendships.requesterId, viewerId), eq(friendships.addresseeId, targetUserId)),
                        and(eq(friendships.requesterId, targetUserId), eq(friendships.addresseeId, viewerId))
                    )
                )
            )
            .limit(1);
        return Boolean(row);
    }

    /**
     * Returns all pending friend requests received by the given user.
     */
    static async getPendingFriendRequests(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.requesterId, users.id))
            .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'PENDING')));
    }

    /**
     * Returns all pending or declined (blocked) friend requests sent by the given user.
     * DECLINED means the addressee blocked the requester — we still show the card to the sender.
     */
    static async getSentPendingRequests(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.addresseeId, users.id))
            .where(
                and(
                    eq(friendships.requesterId, userId),
                    or(eq(friendships.status, 'PENDING'), eq(friendships.status, 'DECLINED'))
                )
            );
    }

    /**
     * Deletes friendship rows between the caller and another user that the caller is allowed to end.
     * Does not delete a BLOCKED row where the caller is the addressee.
     */
    static async deleteFriendship(db: DatabaseOrTransaction, callerId: string, otherUserId: string) {
        return db
            .delete(friendships)
            .where(
                and(
                    or(
                        and(eq(friendships.requesterId, callerId), eq(friendships.addresseeId, otherUserId)),
                        and(eq(friendships.requesterId, otherUserId), eq(friendships.addresseeId, callerId))
                    ),
                    or(ne(friendships.status, 'BLOCKED'), ne(friendships.addresseeId, callerId))
                )
            );
    }

    /**
     * Blocks a user. Preserves any incoming PENDING request as DECLINED, deletes all other
     * rows between the pair, then inserts the (userId→blockId, BLOCKED) row.
     */
    static async blockUser(db: DatabaseOrTransaction, userId: string, blockId: string) {
        return db.transaction(async (tx) => {
            await tx
                .update(friendships)
                .set({ status: 'DECLINED', updatedAt: new Date() })
                .where(
                    and(
                        eq(friendships.requesterId, blockId),
                        eq(friendships.addresseeId, userId),
                        eq(friendships.status, 'PENDING')
                    )
                );

            await tx
                .delete(friendships)
                .where(
                    or(
                        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, blockId)),
                        and(
                            eq(friendships.requesterId, blockId),
                            eq(friendships.addresseeId, userId),
                            ne(friendships.status, 'DECLINED')
                        )
                    )
                );

            return tx
                .insert(friendships)
                .values({ requesterId: userId, addresseeId: blockId, status: 'BLOCKED', updatedAt: new Date() })
                .returning();
        });
    }

    /**
     * Returns all users blocked by the given user.
     */
    static async getBlockedUsers(db: DatabaseOrTransaction, userId: string) {
        return db
            .select({ id: users.id, name: users.name, email: users.email, avatar: users.avatar })
            .from(friendships)
            .innerJoin(users, eq(friendships.addresseeId, users.id))
            .where(and(eq(friendships.requesterId, userId), eq(friendships.status, 'BLOCKED')));
    }

    /**
     * Removes a block placed by userId on blockId, restoring the original pending request if one existed.
     */
    static async unblockUser(db: DatabaseOrTransaction, userId: string, blockId: string) {
        return db.transaction(async (tx) => {
            await tx
                .delete(friendships)
                .where(
                    and(
                        eq(friendships.requesterId, userId),
                        eq(friendships.addresseeId, blockId),
                        eq(friendships.status, 'BLOCKED')
                    )
                );

            await tx
                .update(friendships)
                .set({ status: 'PENDING', updatedAt: new Date() })
                .where(
                    and(
                        eq(friendships.requesterId, blockId),
                        eq(friendships.addresseeId, userId),
                        eq(friendships.status, 'DECLINED')
                    )
                );
        });
    }
}

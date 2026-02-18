import { db } from '@packages/db/src';
import { friendships, users } from '@packages/db/src/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, or } from 'drizzle-orm';
import { z } from 'zod';

import { procedure, router } from '../trpc';

/**
 * Router for handling friend-related operations.
 */
const friendsRouter = router({
    /**
     * Send a friend request by recipient email.
     */
    sendFriendRequestByEmail: procedure
        .input(z.object({ requesterId: z.string(), email: z.string().email() }))
        .mutation(async ({ input }) => {
            const [addressee] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

            if (!addressee) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'No user found with that email.',
                });
            }

            if (addressee.id === input.requesterId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You cannot friend yourself.',
                });
            }

            const [existing] = await db
                .select()
                .from(friendships)
                .where(
                    or(
                        and(eq(friendships.requesterId, input.requesterId), eq(friendships.addresseeId, addressee.id)),
                        and(eq(friendships.requesterId, addressee.id), eq(friendships.addresseeId, input.requesterId))
                    )
                )
                .limit(1);

            if (existing?.status === 'ACCEPTED') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You are already friends with this user.',
                });
            }

            if (existing?.status === 'PENDING') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'A friend request is already pending with this user.',
                });
            }

            return await db
                .insert(friendships)
                .values({
                    requesterId: input.requesterId,
                    addresseeId: addressee.id,
                    status: 'PENDING',
                })
                .onConflictDoNothing()
                .returning();
        }),

    /**
     * Send a friend request.
     */
    sendFriendRequest: procedure
        .input(z.object({ requesterId: z.string(), addresseeId: z.string() }))
        .mutation(async ({ input }) => {
            if (input.requesterId === input.addresseeId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You cannot friend yourself.',
                });
            }

            return await db
                .insert(friendships)
                .values({
                    requesterId: input.requesterId,
                    addresseeId: input.addresseeId,
                    status: 'PENDING',
                })
                .onConflictDoNothing()
                .returning();
        }),

    /**
     * Accept a friend request.
     */
    acceptFriendRequest: procedure
        .input(z.object({ requesterId: z.string(), addresseeId: z.string() }))
        .mutation(async ({ input }) => {
            return await db
                .update(friendships)
                .set({ status: 'ACCEPTED', updatedAt: new Date() })
                .where(
                    and(eq(friendships.requesterId, input.requesterId), eq(friendships.addresseeId, input.addresseeId))
                )
                .returning();
        }),

    /**
     * Get all friends for a user as user objects.
     */
    getFriends: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        const sent = await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(friendships)
            .innerJoin(users, eq(friendships.addresseeId, users.id))
            .where(and(eq(friendships.requesterId, input.userId), eq(friendships.status, 'ACCEPTED')));

        const received = await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(friendships)
            .innerJoin(users, eq(friendships.requesterId, users.id))
            .where(and(eq(friendships.addresseeId, input.userId), eq(friendships.status, 'ACCEPTED')));

        return [...sent, ...received];
    }),

    /**
     * Get pending friend requests for a user (requests they have received).
     */
    getPendingRequests: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        return await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(friendships)
            .innerJoin(users, eq(friendships.requesterId, users.id))
            .where(and(eq(friendships.addresseeId, input.userId), eq(friendships.status, 'PENDING')));
    }),

    /**
     * Remove a friend or decline a request.
     */
    removeFriend: procedure
        .input(z.object({ userId: z.string(), friendId: z.string() }))
        .mutation(async ({ input }) => {
            return await db
                .delete(friendships)
                .where(
                    or(
                        and(eq(friendships.requesterId, input.userId), eq(friendships.addresseeId, input.friendId)),
                        and(eq(friendships.requesterId, input.friendId), eq(friendships.addresseeId, input.userId))
                    )
                );
        }),

    /**
     * Block a user.
     */
    blockUser: procedure.input(z.object({ userId: z.string(), blockId: z.string() })).mutation(async ({ input }) => {
        return await db
            .insert(friendships)
            .values({
                requesterId: input.userId,
                addresseeId: input.blockId,
                status: 'BLOCKED',
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [friendships.requesterId, friendships.addresseeId],
                set: { status: 'BLOCKED', updatedAt: new Date() },
            });
    }),

    /**
     * Get all blocked users for a user.
     */
    getBlockedUsers: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        return await db
            .select()
            .from(friendships)
            .where(and(eq(friendships.requesterId, input.userId), eq(friendships.status, 'BLOCKED')));
    }),

    /**
     * Unblock a user.
     */
    unblockUser: procedure.input(z.object({ userId: z.string(), blockId: z.string() })).mutation(async ({ input }) => {
        return await db
            .update(friendships)
            .set({ status: 'DECLINED', updatedAt: new Date() })
            .where(and(eq(friendships.requesterId, input.userId), eq(friendships.addresseeId, input.blockId)));
    }),
});

export default friendsRouter;

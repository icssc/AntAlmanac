import { db } from '@packages/db/src';
import { friendships, schedules, sessions, users } from '@packages/db/src/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, gt, or } from 'drizzle-orm';
import { z } from 'zod';

import { procedure, router } from '../trpc';

/**
 * Resolves a session token to an internal userId, verifying the session is valid and not expired.
 */
async function resolveSessionToUserId(sessionToken: string): Promise<string> {
    const [session] = await db
        .select({ userId: sessions.userId })
        .from(sessions)
        .where(and(eq(sessions.refreshToken, sessionToken), gt(sessions.expires, new Date())))
        .limit(1);
    if (!session) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired session.' });
    }
    return session.userId;
}

/**
 * Router for handling friend-related operations, including sending and accepting friend requests,
 * retrieving friends and pending requests, removing or blocking users, and managing
 * per-schedule sharing visibility with friends.
 */
const friendsRouter = router({
    /**
     * Send a friend request by recipient email.
     */
    sendFriendRequestByEmail: procedure
        .input(z.object({ sessionToken: z.string(), email: z.string().email() }))
        .mutation(async ({ input }) => {
            const requesterId = await resolveSessionToUserId(input.sessionToken);

            const [addressee] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

            if (!addressee) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'No user found with that email.',
                });
            }

            if (addressee.id === requesterId) {
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
                        and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addressee.id)),
                        and(eq(friendships.requesterId, addressee.id), eq(friendships.addresseeId, requesterId))
                    )
                )
                .limit(1);

            if (existing?.status === 'ACCEPTED') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You are already friends with this user.',
                });
            }

            if (existing?.status === 'BLOCKED' || existing?.status === 'PENDING') {
                const theyRequestedYou = existing.requesterId === addressee.id && existing.addresseeId === requesterId;
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: theyRequestedYou
                        ? 'This user has already sent you a friend request. Check your Requests tab to accept.'
                        : 'A friend request is already pending with this user.',
                });
            }

            return await db
                .insert(friendships)
                .values({
                    requesterId: requesterId,
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
        .input(z.object({ sessionToken: z.string(), addresseeId: z.string() }))
        .mutation(async ({ input }) => {
            const requesterId = await resolveSessionToUserId(input.sessionToken);

            if (requesterId === input.addresseeId) {
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
                        and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, input.addresseeId)),
                        and(eq(friendships.requesterId, input.addresseeId), eq(friendships.addresseeId, requesterId))
                    )
                )
                .limit(1);

            if (existing?.status === 'ACCEPTED') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You are already friends with this user.',
                });
            }

            if (existing?.status === 'BLOCKED' || existing?.status === 'PENDING') {
                const theyRequestedYou =
                    existing.requesterId === input.addresseeId && existing.addresseeId === requesterId;
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: theyRequestedYou
                        ? 'This user has already sent you a friend request. Check your Requests tab to accept.'
                        : 'A friend request is already pending with this user.',
                });
            }

            return await db
                .insert(friendships)
                .values({
                    requesterId: requesterId,
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
        .input(z.object({ sessionToken: z.string(), requesterId: z.string() }))
        .mutation(async ({ input }) => {
            const addresseeId = await resolveSessionToUserId(input.sessionToken);

            return await db
                .update(friendships)
                .set({ status: 'ACCEPTED', updatedAt: new Date() })
                .where(
                    and(
                        eq(friendships.requesterId, input.requesterId),
                        eq(friendships.addresseeId, addresseeId),
                        eq(friendships.status, 'PENDING')
                    )
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
     * Check if two users are friends (ACCEPTED friendship in either direction).
     */
    areFriends: procedure
        .input(z.object({ viewerId: z.string(), targetUserId: z.string() }))
        .query(async ({ input }) => {
            const [row] = await db
                .select({ id: friendships.requesterId })
                .from(friendships)
                .where(
                    and(
                        eq(friendships.status, 'ACCEPTED'),
                        or(
                            and(
                                eq(friendships.requesterId, input.viewerId),
                                eq(friendships.addresseeId, input.targetUserId)
                            ),
                            and(
                                eq(friendships.requesterId, input.targetUserId),
                                eq(friendships.addresseeId, input.viewerId)
                            )
                        )
                    )
                )
                .limit(1);
            return Boolean(row);
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
        .input(z.object({ sessionToken: z.string(), friendId: z.string() }))
        .mutation(async ({ input }) => {
            const userId = await resolveSessionToUserId(input.sessionToken);

            return await db
                .delete(friendships)
                .where(
                    or(
                        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, input.friendId)),
                        and(eq(friendships.requesterId, input.friendId), eq(friendships.addresseeId, userId))
                    )
                );
        }),

    /**
     * Block a user.
     */
    blockUser: procedure
        .input(z.object({ sessionToken: z.string(), blockId: z.string() }))
        .mutation(async ({ input }) => {
            const userId = await resolveSessionToUserId(input.sessionToken);

            await db
                .delete(friendships)
                .where(
                    or(
                        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, input.blockId)),
                        and(eq(friendships.requesterId, input.blockId), eq(friendships.addresseeId, userId))
                    )
                );

            return await db
                .insert(friendships)
                .values({
                    requesterId: userId,
                    addresseeId: input.blockId,
                    status: 'BLOCKED',
                    updatedAt: new Date(),
                })
                .returning();
        }),

    /**
     * Get all blocked users for a user.
     */
    getBlockedUsers: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        return await db
            .select({ id: users.id, name: users.name, email: users.email })
            .from(friendships)
            .innerJoin(users, eq(friendships.addresseeId, users.id))
            .where(and(eq(friendships.requesterId, input.userId), eq(friendships.status, 'BLOCKED')));
    }),

    /**
     * Unblock a user.
     */
    unblockUser: procedure
        .input(z.object({ sessionToken: z.string(), blockId: z.string() }))
        .mutation(async ({ input }) => {
            const userId = await resolveSessionToUserId(input.sessionToken);

            return await db
                .delete(friendships)
                .where(and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, input.blockId)));
        }),

    /**
     * Get the sharing status (sharedWithFriends) for all schedules owned by the user.
     */
    getScheduleSharingStatuses: procedure.input(z.object({ sessionToken: z.string() })).query(async ({ input }) => {
        const userId = await resolveSessionToUserId(input.sessionToken);
        return await db
            .select({ id: schedules.id, sharedWithFriends: schedules.sharedWithFriends })
            .from(schedules)
            .where(eq(schedules.userId, userId));
    }),

    /**
     * Toggle whether a schedule is shared with friends.
     */
    toggleScheduleSharing: procedure
        .input(z.object({ sessionToken: z.string(), scheduleId: z.string() }))
        .mutation(async ({ input }) => {
            const userId = await resolveSessionToUserId(input.sessionToken);

            const [schedule] = await db
                .select({ sharedWithFriends: schedules.sharedWithFriends })
                .from(schedules)
                .where(and(eq(schedules.id, input.scheduleId), eq(schedules.userId, userId)))
                .limit(1);

            if (!schedule) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found.' });
            }

            const [updated] = await db
                .update(schedules)
                .set({ sharedWithFriends: !schedule.sharedWithFriends })
                .where(and(eq(schedules.id, input.scheduleId), eq(schedules.userId, userId)))
                .returning({ sharedWithFriends: schedules.sharedWithFriends });

            return { sharedWithFriends: updated.sharedWithFriends };
        }),
});

export default friendsRouter;

import { db } from '@packages/db/src';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { RDS } from '../lib/rds';
import { procedure, router } from '../trpc';

async function resolveSessionToUserId(sessionToken: string): Promise<string> {
    const userId = await RDS.getUserIdBySessionToken(db, sessionToken);
    if (!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired session.' });
    }
    return userId;
}

async function assertSessionMatchesUser(sessionToken: string, claimedUserId: string): Promise<void> {
    const authenticatedId = await resolveSessionToUserId(sessionToken);
    if (authenticatedId !== claimedUserId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied.' });
    }
}

async function validateAndSendFriendRequest(requesterId: string, addresseeId: string) {
    const existing = await RDS.getFriendshipBetween(db, requesterId, addresseeId);

    if (existing?.status === 'ACCEPTED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'You are already friends with this user.' });
    }

    if (existing?.status === 'BLOCKED' || existing?.status === 'PENDING') {
        const theyRequestedYou = existing.requesterId === addresseeId && existing.addresseeId === requesterId;
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: theyRequestedYou
                ? 'This user has already sent you a friend request. Check your Requests tab to accept.'
                : 'A friend request is already pending with this user.',
        });
    }

    return RDS.insertFriendRequest(db, requesterId, addresseeId);
}

/**
 * Router for handling friend-related operations, including sending and accepting friend requests,
 * retrieving friends and pending requests, removing or blocking users, and managing
 * per-schedule sharing visibility with friends.
 */
const friendsRouter = router({
    /**
     * Sends a friend request to a user identified by their email address.
     * Validates the session token, ensures the requester is not friending themselves,
     * and checks for existing pending or accepted friendships before inserting.
     */
    sendFriendRequestByEmail: procedure
        .input(z.object({ sessionToken: z.string(), email: z.string().email() }))
        .mutation(async ({ input }) => {
            const requesterId = await resolveSessionToUserId(input.sessionToken);

            const addressee = await RDS.getUserByEmail(db, input.email);

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

            return validateAndSendFriendRequest(requesterId, addressee.id);
        }),

    /**
     * Sends a friend request to a user identified by their user ID.
     * Validates the session token, ensures the requester is not friending themselves,
     * and checks for existing pending or accepted friendships before inserting.
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

            return validateAndSendFriendRequest(requesterId, input.addresseeId);
        }),

    /**
     * Accepts a pending friend request from the given requester.
     * Validates the session token to identify the addressee, then updates the
     * friendship status from PENDING to ACCEPTED.
     */
    acceptFriendRequest: procedure
        .input(z.object({ sessionToken: z.string(), requesterId: z.string() }))
        .mutation(async ({ input }) => {
            const addresseeId = await resolveSessionToUserId(input.sessionToken);
            return RDS.acceptFriendRequest(db, input.requesterId, addresseeId);
        }),

    /**
     * Returns all accepted friends for the given user as an array of user objects (id, name, email).
     * Unions friendships where the user is either the requester or the addressee.
     * Requires a valid session token matching the requested userId.
     */
    getFriends: procedure.input(z.object({ sessionToken: z.string(), userId: z.string() })).query(async ({ input }) => {
        await assertSessionMatchesUser(input.sessionToken, input.userId);
        return RDS.getFriends(db, input.userId);
    }),

    /**
     * Returns true if an ACCEPTED friendship exists between the viewer and the target user
     * in either direction (viewer → target or target → viewer).
     * Requires a valid session token matching the viewerId.
     */
    areFriends: procedure
        .input(z.object({ sessionToken: z.string(), viewerId: z.string(), targetUserId: z.string() }))
        .query(async ({ input }) => {
            await assertSessionMatchesUser(input.sessionToken, input.viewerId);
            return RDS.areFriends(db, input.viewerId, input.targetUserId);
        }),

    /**
     * Returns all pending friend requests received by the given user,
     * including the requester's id, name, and email.
     * Requires a valid session token matching the requested userId.
     */
    getPendingRequests: procedure
        .input(z.object({ sessionToken: z.string(), userId: z.string() }))
        .query(async ({ input }) => {
            await assertSessionMatchesUser(input.sessionToken, input.userId);
            return RDS.getPendingFriendRequests(db, input.userId);
        }),

    /**
     * Removes an existing friendship or declines a pending friend request.
     * Validates the session token to identify the caller, then deletes the friendship
     * row regardless of which side initiated it.
     */
    removeFriend: procedure
        .input(z.object({ sessionToken: z.string(), friendId: z.string() }))
        .mutation(async ({ input }) => {
            const userId = await resolveSessionToUserId(input.sessionToken);
            return RDS.deleteFriendship(db, userId, input.friendId);
        }),

    /**
     * Blocks a user by removing any existing friendship and inserting a BLOCKED record.
     * Validates the session token to identify the caller before modifying the friendship table.
     */
    blockUser: procedure
        .input(z.object({ sessionToken: z.string(), blockId: z.string() }))
        .mutation(async ({ input }) => {
            const userId = await resolveSessionToUserId(input.sessionToken);
            return RDS.blockUser(db, userId, input.blockId);
        }),

    /**
     * Get all blocked users for a user.
     * Requires a valid session token matching the requested userId.
     */
    getBlockedUsers: procedure
        .input(z.object({ sessionToken: z.string(), userId: z.string() }))
        .query(async ({ input }) => {
            await assertSessionMatchesUser(input.sessionToken, input.userId);
            return RDS.getBlockedUsers(db, input.userId);
        }),

    /**
     * Unblock a user.
     */
    unblockUser: procedure
        .input(z.object({ sessionToken: z.string(), blockId: z.string() }))
        .mutation(async ({ input }) => {
            const userId = await resolveSessionToUserId(input.sessionToken);
            return RDS.unblockUser(db, userId, input.blockId);
        }),

    /**
     * Get the sharing status (sharedWithFriends) for all schedules owned by the user.
     */
    getScheduleSharingStatuses: procedure.input(z.object({ sessionToken: z.string() })).query(async ({ input }) => {
        const userId = await resolveSessionToUserId(input.sessionToken);
        return RDS.getScheduleSharingStatuses(db, userId);
    }),

    /**
     * Toggle whether a schedule is shared with friends.
     */
    toggleScheduleSharing: procedure
        .input(z.object({ sessionToken: z.string(), scheduleId: z.string() }))
        .mutation(async ({ input }) => {
            const userId = await resolveSessionToUserId(input.sessionToken);
            const result = await RDS.toggleScheduleSharing(db, userId, input.scheduleId);
            if (!result) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found.' });
            }
            return result;
        }),
});

export default friendsRouter;

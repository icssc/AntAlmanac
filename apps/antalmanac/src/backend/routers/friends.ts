import { db } from '@packages/db/src';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { RDS } from '../lib/rds';
import { protectedProcedure, router } from '../trpc';

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
 *
 * All procedures are protected — identity is resolved from the session cookie via ctx.userId.
 */
const friendsRouter = router({
    /**
     * Sends a friend request to a user identified by their email address.
     */
    sendFriendRequestByEmail: protectedProcedure
        .input(z.object({ email: z.string().email() }))
        .mutation(async ({ input, ctx }) => {
            const addressee = await RDS.getUserByEmail(db, input.email);

            if (!addressee) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'No user found with that email.',
                });
            }

            if (addressee.id === ctx.userId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You cannot friend yourself.',
                });
            }

            return validateAndSendFriendRequest(ctx.userId, addressee.id);
        }),

    /**
     * Sends a friend request to a user identified by their user ID.
     */
    sendFriendRequest: protectedProcedure
        .input(z.object({ addresseeId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            if (ctx.userId === input.addresseeId) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You cannot friend yourself.',
                });
            }

            return validateAndSendFriendRequest(ctx.userId, input.addresseeId);
        }),

    /**
     * Accepts a pending friend request from the given requester.
     */
    acceptFriendRequest: protectedProcedure
        .input(z.object({ requesterId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const result = await RDS.acceptFriendRequest(db, input.requesterId, ctx.userId);
            if (result.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'This friend request no longer exists.',
                });
            }
            return result;
        }),

    /**
     * Returns all accepted friends for the authenticated user.
     */
    getFriends: protectedProcedure.query(async ({ ctx }) => {
        return RDS.getFriends(db, ctx.userId);
    }),

    /**
     * Returns true if an ACCEPTED friendship exists between the viewer and the target user.
     */
    areFriends: protectedProcedure.input(z.object({ targetUserId: z.string() })).query(async ({ input, ctx }) => {
        return RDS.areFriends(db, ctx.userId, input.targetUserId);
    }),

    /**
     * Returns all pending friend requests received by the authenticated user.
     */
    getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
        return RDS.getPendingFriendRequests(db, ctx.userId);
    }),

    /**
     * Returns all pending friend requests sent by the authenticated user.
     */
    getSentRequests: protectedProcedure.query(async ({ ctx }) => {
        return RDS.getSentPendingRequests(db, ctx.userId);
    }),

    /**
     * Removes an existing friendship or declines a pending friend request.
     */
    removeFriend: protectedProcedure.input(z.object({ friendId: z.string() })).mutation(async ({ input, ctx }) => {
        return RDS.deleteFriendship(db, ctx.userId, input.friendId);
    }),

    /**
     * Blocks a user by removing any existing friendship and inserting a BLOCKED record.
     */
    blockUser: protectedProcedure.input(z.object({ blockId: z.string() })).mutation(async ({ input, ctx }) => {
        return RDS.blockUser(db, ctx.userId, input.blockId);
    }),

    /**
     * Returns all blocked users for the authenticated user.
     */
    getBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
        return RDS.getBlockedUsers(db, ctx.userId);
    }),

    /**
     * Unblocks a user.
     */
    unblockUser: protectedProcedure.input(z.object({ blockId: z.string() })).mutation(async ({ input, ctx }) => {
        return RDS.unblockUser(db, ctx.userId, input.blockId);
    }),

    /**
     * Get the sharing status (sharedWithFriends) for all schedules owned by the authenticated user.
     */
    getScheduleSharingStatuses: protectedProcedure.query(async ({ ctx }) => {
        return RDS.getScheduleSharingStatuses(db, ctx.userId);
    }),

    /**
     * Toggle whether a schedule is shared with friends.
     */
    toggleScheduleSharing: protectedProcedure
        .input(z.object({ scheduleId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const result = await RDS.toggleScheduleSharing(db, ctx.userId, input.scheduleId);
            if (!result) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found.' });
            }
            return result;
        }),
});

export default friendsRouter;

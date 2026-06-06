import {
    getDismissedCombos,
    getReviewPromptLastInteractionAt,
    getReviewedCombos,
    insertInstructorReview,
    insertReviewDismissal,
} from '$src/backend/lib/rds/reviews';
import { db } from '@packages/db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, router } from '../trpc';

const reviewTagsEnum = z.enum([
    'Textbook Required',
    'Mandatory Lecture',
    'Mandatory Discussion',
    'Curved',
    'Extra Credit',
    'Project Based',
    'Test Heavy',
]);

const submitReviewInput = z.object({
    /** Raw WebSOC instructor name, e.g. "PATTIS, R." */
    professorId: z.string(),
    /** Course string, e.g. "ICS 31" */
    courseId: z.string(),
    /** AntAlmanac term shortName, e.g. "2024 Fall" */
    termShortName: z.string(),
    /** 1–5 star rating */
    rating: z.number().int().min(1).max(5),
    difficulty: z.number().int().min(1).max(5),
    tags: z.array(reviewTagsEnum).default([]),
    anonymous: z.boolean().default(true),
    content: z.string().max(500).optional(),
});

const reviewRouter = router({
    /**
     * Submit a quick review for a course/professor from a user's schedule.
     * Enforces one review per (userId, professorId, courseId, term) combination.
     */
    submitReview: protectedProcedure.input(submitReviewInput).mutation(async ({ ctx, input }) => {
        const { termShortName, ...review } = input;
        const inserted = await insertInstructorReview(db, ctx.userId, {
            ...review,
            quarter: termShortName,
        });

        if (inserted == null) {
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'You have already reviewed this course with this professor.',
            });
        }

        return inserted;
    }),

    /**
     * Returns all (professorId, courseId, term) combos already reviewed by this user.
     * Used on the client to filter out candidates that don't need a prompt.
     */
    getReviewedCombos: protectedProcedure.query(async ({ ctx }) => {
        return getReviewedCombos(db, ctx.userId);
    }),

    /**
     * Dismiss a review prompt for a course/professor.
     */
    dismissReview: protectedProcedure
        .input(z.object({ professorId: z.string(), courseId: z.string(), termShortName: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await insertReviewDismissal(db, ctx.userId, input.professorId, input.courseId, input.termShortName);
        }),

    /**
     * Returns all (professorId, courseId, term) combos dismissed by this user.
     */
    getDismissedCombos: protectedProcedure.query(async ({ ctx }) => {
        return getDismissedCombos(db, ctx.userId);
    }),

    /**
     * Latest time the user dismissed a review prompt or submitted a quick review.
     */
    getReviewPromptLastInteractionAt: protectedProcedure.query(async ({ ctx }) => {
        return getReviewPromptLastInteractionAt(db, ctx.userId);
    }),
});

export default reviewRouter;

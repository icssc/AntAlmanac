import { db } from '@packages/db';
import { instructorReviews } from '@packages/db/src/schema';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { procedure, router } from '../trpc';

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
    userId: z.string(),
    /** Raw WebSOC instructor name, e.g. "PATTIS, R." */
    professorId: z.string(),
    /** Course string, e.g. "ICS 31" */
    courseId: z.string(),
    /** AntAlmanac term shortName, e.g. "Fall 2024" */
    quarter: z.string(),
    /** 1–5 star rating */
    rating: z.number().int().min(1).max(5),
    tags: z.array(reviewTagsEnum).default([]),
    anonymous: z.boolean().default(true),
});

const reviewRouter = router({
    /**
     * Submit a quick review for a course/professor from a user's schedule.
     * Enforces one review per (userId, professorId, courseId) combination.
     */
    submitReview: procedure.input(submitReviewInput).mutation(async ({ input }) => {
        const existing = await db
            .select({ id: instructorReviews.id })
            .from(instructorReviews)
            .where(
                and(
                    eq(instructorReviews.userId, input.userId),
                    eq(instructorReviews.professorId, input.professorId),
                    eq(instructorReviews.courseId, input.courseId)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            throw new TRPCError({
                code: 'CONFLICT',
                message: 'You have already reviewed this course with this professor.',
            });
        }

        const [inserted] = await db
            .insert(instructorReviews)
            .values({
                userId: input.userId,
                professorId: input.professorId,
                courseId: input.courseId,
                quarter: input.quarter,
                rating: input.rating,
                tags: input.tags,
                anonymous: input.anonymous,
            })
            .returning({ id: instructorReviews.id });

        return inserted;
    }),

    /**
     * Returns all (professorId, courseId) combos already reviewed by this user.
     * Used on the client to filter out candidates that don't need a prompt.
     */
    getReviewedCombos: procedure.input(z.object({ userId: z.string() })).query(async ({ input }) => {
        return db
            .select({
                professorId: instructorReviews.professorId,
                courseId: instructorReviews.courseId,
            })
            .from(instructorReviews)
            .where(eq(instructorReviews.userId, input.userId));
    }),
});

export default reviewRouter;

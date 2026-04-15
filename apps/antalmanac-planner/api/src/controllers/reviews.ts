/**
 @module ReviewRoute
*/

import { adminProcedure, publicProcedure, router, userProcedure } from '../helpers/trpc';
import { z } from 'zod';
import {
  anonymousName,
  editReviewSubmission,
  featuredQuery,
  FeaturedReviewData,
  ReviewData,
  reviewSubmission,
  reviewInput,
} from '@peterportal/types';
import { TRPCError } from '@trpc/server';
import { db } from '../db';
import { review, user, vote } from '../db/schema';
import { and, avg, count, desc, eq, sql } from 'drizzle-orm';
import { datesToStrings } from '../helpers/date';

async function userWroteReview(userId: number | undefined, reviewId: number) {
  if (!userId) {
    return false;
  }

  return (
    (
      await db
        .select({ count: count() })
        .from(review)
        .where(and(eq(review.id, reviewId), eq(review.userId, userId)))
    )[0].count > 0
  );
}

async function getReviews(
  where: {
    courseId?: string;
    professorId?: string;
    userId?: number;
    reviewId?: number;
    verified?: boolean;
  },
  sessUserId?: number,
  isAdminView?: boolean,
) {
  const { courseId, professorId, userId, reviewId, verified } = where;
  const userVoteSubquery = db
    .select({ reviewId: vote.reviewId, userVote: vote.vote })
    .from(vote)
    .where(eq(vote.userId, sessUserId!))
    .as('user_vote_query');
  const results = await db
    .select({
      review: review,
      score: sql`COALESCE(SUM(${vote.vote}), 0)`.mapWith(Number),
      userDisplay: user.name,
      userVote: sql`COALESCE(${userVoteSubquery.userVote}, 0)`.mapWith(Number),
    })
    .from(review)
    .where(
      and(
        courseId ? eq(review.courseId, courseId) : undefined,
        professorId ? eq(review.professorId, professorId) : undefined,
        userId ? eq(review.userId, userId) : undefined,
        reviewId ? eq(review.id, reviewId) : undefined,
        verified !== undefined ? eq(review.verified, verified) : undefined,
      ),
    )
    .leftJoin(vote, eq(vote.reviewId, review.id))
    .leftJoin(user, eq(user.id, review.userId))
    .leftJoin(userVoteSubquery, eq(userVoteSubquery.reviewId, review.id))
    .groupBy(review.id, user.name, userVoteSubquery.userVote)
    .orderBy(desc(sql`COALESCE(SUM(${vote.vote}), 0)`), desc(review.createdAt));

  if (results) {
    return results.map(({ review, score, userDisplay, userVote }) =>
      datesToStrings({
        ...review,
        score,
        userDisplay: review.anonymous && !isAdminView ? anonymousName : userDisplay!,
        userVote: userVote,
        authored: sessUserId === review.userId,
      }),
    ) as ReviewData[];
  } else {
    return [];
  }
}

const reviewsRouter = router({
  getUsersReviews: userProcedure.query(async ({ ctx }) => {
    return await getReviews({ userId: ctx.session.userId }, ctx.session.userId, false);
  }),
  /**
   * Query reviews
   */
  get: publicProcedure.input(reviewInput).query(async ({ input, ctx }) => {
    return await getReviews({ ...input }, ctx.session.userId, false);
  }),

  /**
   * Query reviews for admin view
   */
  getAdminView: adminProcedure.input(reviewInput).query(async ({ input, ctx }) => {
    return await getReviews({ ...input }, ctx.session.userId, ctx.session.isAdmin);
  }),

  /**
   * Add a review
   */
  add: userProcedure.input(reviewSubmission).mutation(async ({ input, ctx }) => {
    const userId = ctx.session.userId!;
    const userName = ctx.session.userName!;

    // check if user is trusted
    const { verifiedCount } = (
      await db
        .select({ verifiedCount: count() })
        .from(review)
        .where(and(eq(review.userId, userId), eq(review.verified, true)))
    )[0];
    const reviewToAdd = {
      ...input,
      userId: userId,
      verified: verifiedCount >= 3, // auto-verify if use has 3+ verified reviews
      updatedAt: input.updatedAt ? new Date(input.updatedAt) : undefined,
    };

    const addedReview = (await db.insert(review).values(reviewToAdd).returning())[0];
    return datesToStrings({
      ...addedReview,
      userDisplay: input.anonymous ? anonymousName : userName,
      score: 0,
      userVote: 0,
      authored: true,
    }) as ReviewData;
  }),

  /**
   * Delete a review (user can delete their own or admin can delete any through reports)
   */
  delete: userProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    if (ctx.session.isAdmin || (await userWroteReview(ctx.session.userId, input.id))) {
      await db.delete(review).where(eq(review.id, input.id));
      return true;
    } else {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Must be an admin or review author to delete reviews!' });
    }
  }),

  /**
   * Vote on a review
   */
  vote: userProcedure
    .input(z.object({ id: z.number(), vote: z.number().int().min(-1).max(1) }))
    .mutation(async ({ input, ctx }) => {
      if (input.vote === 0) {
        await db.delete(vote).where(and(eq(vote.userId, ctx.session.userId!), eq(vote.reviewId, input.id)));
        return true;
      }

      await db
        .insert(vote)
        .values({ userId: ctx.session.userId!, reviewId: input.id, vote: input.vote })
        .onConflictDoUpdate({ target: [vote.userId, vote.reviewId], set: { vote: input.vote } });
    }),

  verify: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await db.update(review).set({ verified: true }).where(eq(review.id, input.id));
    return true;
  }),

  edit: userProcedure.input(editReviewSubmission).mutation(async ({ input, ctx }) => {
    if (!(await userWroteReview(ctx.session.userId, input.id))) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You are not the author of this review.' });
    }

    const { id, ...updateWithoutId } = input;
    await db
      .update(review)
      .set({
        ...updateWithoutId,
        updatedAt: new Date(),
      })
      .where(eq(review.id, id));
    return true;
  }),

  /**
   * Get featured review for a course or professor
   */
  featured: publicProcedure.input(featuredQuery).query(async ({ input }) => {
    const voteSubQuery = db
      .select({ reviewId: vote.reviewId, score: sql`sum(${vote.vote})`.mapWith(Number).as('score') })
      .from(vote)
      .groupBy(vote.reviewId)
      .as('vote_query');

    const featuredReviewCriteria = [desc(review.content), desc(voteSubQuery.score), desc(review.verified)];

    const field = input.type === 'course' ? review.courseId : review?.professorId;
    const featuredReview = await db
      .select()
      .from(review)
      .where(eq(field, input.id))
      .leftJoin(voteSubQuery, eq(voteSubQuery.reviewId, review.id))
      .orderBy(...featuredReviewCriteria)
      .limit(1);

    return featuredReview.length > 0 ? (datesToStrings(featuredReview[0].review) as FeaturedReviewData) : undefined;
  }),

  /**
   * Get avg ratings for a course's professors or a professor's courses
   */
  avgRating: publicProcedure
    .input(z.object({ type: z.enum(['course', 'professor']), id: z.string() }))
    .query(async ({ input }) => {
      const field = input.type === 'course' ? review.courseId : review.professorId;
      const otherField = input.type === 'course' ? review.professorId : review.courseId;

      const results = await db
        .select({ name: otherField, avgRating: avg(review.rating).mapWith(Number) })
        .from(review)
        .where(eq(field, input.id))
        .groupBy(otherField);

      return results;
    }),
});

export default reviewsRouter;

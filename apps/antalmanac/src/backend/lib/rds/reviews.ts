import type { DatabaseOrTransaction } from '$backend/lib/rds/types';
import { instructorReviews, type NewInstructorReview, reviewDismissals } from '@packages/db/src/schema';
import { eq, max } from 'drizzle-orm';

export async function insertInstructorReview(
    db: DatabaseOrTransaction,
    userId: string,
    values: Pick<
        NewInstructorReview,
        'professorId' | 'courseId' | 'quarter' | 'rating' | 'difficulty' | 'tags' | 'anonymous' | 'content'
    >
) {
    const [inserted] = await db
        .insert(instructorReviews)
        .values({
            userId,
            ...values,
        })
        .onConflictDoNothing({
            target: [
                instructorReviews.userId,
                instructorReviews.professorId,
                instructorReviews.courseId,
                instructorReviews.quarter,
            ],
        })
        .returning({ id: instructorReviews.id });

    return inserted ?? null;
}

export async function getReviewedCombos(db: DatabaseOrTransaction, userId: string) {
    return db
        .select({
            professorId: instructorReviews.professorId,
            courseId: instructorReviews.courseId,
            term: instructorReviews.quarter,
        })
        .from(instructorReviews)
        .where(eq(instructorReviews.userId, userId));
}

export async function insertReviewDismissal(
    db: DatabaseOrTransaction,
    userId: string,
    professorId: string,
    courseId: string,
    termShortName: string
) {
    return db
        .insert(reviewDismissals)
        .values({
            userId,
            professorId,
            courseId,
            term: termShortName,
        })
        .onConflictDoNothing();
}

export async function getDismissedCombos(db: DatabaseOrTransaction, userId: string) {
    return db
        .select({
            professorId: reviewDismissals.professorId,
            courseId: reviewDismissals.courseId,
            term: reviewDismissals.term,
        })
        .from(reviewDismissals)
        .where(eq(reviewDismissals.userId, userId));
}

export async function getReviewPromptLastInteractionAt(db: DatabaseOrTransaction, userId: string) {
    const [[dismissRow], [reviewRow]] = await Promise.all([
        db
            .select({ createdAt: max(reviewDismissals.createdAt) })
            .from(reviewDismissals)
            .where(eq(reviewDismissals.userId, userId)),
        db
            .select({ createdAt: max(instructorReviews.createdAt) })
            .from(instructorReviews)
            .where(eq(instructorReviews.userId, userId)),
    ]);

    const timestamps = [dismissRow?.createdAt, reviewRow?.createdAt].filter(
        (d): d is NonNullable<typeof d> => d != null
    );

    const lastInteractionAt =
        timestamps.length === 0 ? null : new Date(Math.max(...timestamps.map((d) => new Date(d).getTime())));

    return { lastInteractionAt };
}

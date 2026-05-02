import { createId } from '@paralleldrive/cuid2';
import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { users } from '../auth/user';

/**
 * Tracks review prompt dismissals so users are not re-prompted for a
 * course/professor combo they have already declined to review.
 */
export const reviewDismissals = pgTable(
    'reviewDismissals',
    {
        id: text('id').primaryKey().$defaultFn(createId),

        /** The user who dismissed the prompt. */
        userId: text('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),

        /** Raw WebSOC instructor name, e.g. "PATTIS, R." */
        professorId: text('professor_id').notNull(),

        /** Course identifier string, e.g. "ICS 31". */
        courseId: text('course_id').notNull(),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [
        unique('unique_dismissal').on(table.userId, table.professorId, table.courseId),
        index('dismissals_user_id_idx').on(table.userId),
    ]
);

export type ReviewDismissal = typeof reviewDismissals.$inferSelect;
export type NewReviewDismissal = typeof reviewDismissals.$inferInsert;

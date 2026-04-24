import { createId } from '@paralleldrive/cuid2';
import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { users } from '../auth/user';

/**
 * Instructor reviews submitted by AntAlmanac Scheduler users.
 *
 * Schema mirrors Planner's `review` table column-for-column to allow
 * future reconciliation. Columns not collected in the quick-review UI
 * are nullable here even if they are NOT NULL in Planner.
 *
 * Key differences from Planner:
 *  - `id` uses a CUID text PK instead of an integer identity column.
 *  - `userId` references AntAlmanac's `users` table (text CUID) and is
 *    nullable to support anonymous/unlinked submissions.
 *  - `professorId` stores the raw instructor name from WebSOC (e.g.
 *    "PATTIS, R.") rather than a UCINetID slug — mapping to Planner's
 *    UCINetID-based professorId will be handled during reconciliation.
 *  - `difficulty` and `forCredit` are nullable (NOT NULL in Planner).
 *  - `source` is an extra column to identify the origin during reconciliation.
 */
export const instructorReviews = pgTable(
    'instructorReviews',
    {
        /** CUID primary key. */
        id: text('id').primaryKey().$defaultFn(createId),

        /**
         * Raw instructor name from WebSOC section data (e.g. "PATTIS, R.").
         * Maps to Planner's `professor_id` (UCINetID slug) after reconciliation.
         */
        professorId: text('professor_id').notNull(),

        /**
         * Course identifier string (e.g. "ICS 31").
         * Matches Planner's `course_id` format.
         */
        courseId: text('course_id').notNull(),

        /**
         * AntAlmanac user ID. Nullable to allow anonymous submissions.
         */
        userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),

        /** Whether the review is displayed anonymously. Defaults to true. */
        anonymous: boolean('anonymous').notNull().default(true),

        /** Optional free-text review body. Not collected in the quick-review UI. */
        content: text('content'),

        /** Overall quality rating 1–5. */
        rating: integer('rating').notNull(),

        /**
         * Difficulty rating 1–5.
         * Nullable here; NOT NULL in Planner — left empty by quick-review UI.
         */
        difficulty: integer('difficulty'),

        /** Letter grade received. Not collected in the quick-review UI. */
        gradeReceived: text('grade_received'),

        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

        updatedAt: timestamp('updated_at', { withTimezone: true }),

        /**
         * Whether the course was taken for credit.
         * Nullable here; NOT NULL in Planner — left empty by quick-review UI.
         */
        forCredit: boolean('for_credit'),

        /**
         * The academic quarter the course was taken.
         * Stored as the AntAlmanac term shortName (e.g. "Fall 2024").
         */
        quarter: text('quarter').notNull(),

        /** Would take again? Not collected in the quick-review UI. */
        takeAgain: boolean('take_again'),

        /** Was a textbook required? Not collected in the quick-review UI. */
        textbook: boolean('textbook'),

        /** Was attendance mandatory? Not collected in the quick-review UI. */
        attendance: boolean('attendance'),

        /**
         * Selected tags from the predefined list.
         * Uses Planner's tag vocabulary for schema alignment.
         */
        tags: text('tags').array(),

        /**
         * Whether the review has been verified by a moderator.
         * Defaults to false; managed by Planner's admin tooling after reconciliation.
         */
        verified: boolean('verified').notNull().default(false),

        /** Identifies reviews originating from AntAlmanac for reconciliation. */
        source: text('source').notNull().default('antalmanac'),
    },
    (table) => [
        check('rating_check', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
        check(
            'difficulty_check',
            sql`${table.difficulty} IS NULL OR (${table.difficulty} >= 1 AND ${table.difficulty} <= 5)`
        ),
        unique('unique_review').on(table.userId, table.professorId, table.courseId),
        index('reviews_professor_id_idx').on(table.professorId),
        index('reviews_course_id_idx').on(table.courseId),
    ]
);

export type InstructorReview = typeof instructorReviews.$inferSelect;
export type NewInstructorReview = typeof instructorReviews.$inferInsert;

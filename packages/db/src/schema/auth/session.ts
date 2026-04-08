import { createId } from '@paralleldrive/cuid2';
import { timestamp, pgTable, text } from 'drizzle-orm/pg-core';

import { users } from './user';

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey().$defaultFn(createId),

    userId: text('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),

    expires: timestamp('expires').notNull(),

    refreshToken: text('refresh_token').$defaultFn(createId),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdateFn(() => new Date()),
});

export type Session = typeof sessions.$inferSelect;

import { createId } from '@paralleldrive/cuid2';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';

import { user } from './user';

export const session = pgTable('session', {
    id: text('id').primaryKey().$defaultFn(createId),

    userId: text('user_id')
        .references(() => user.id, { onDelete: 'cascade' })
        .notNull(),

    expires: integer('expires').notNull(),

    status: text('status').default('ACTIVE'),

    refreshToken: text('refresh_token').$defaultFn(createId),
});

export type Session = typeof session.$inferSelect;

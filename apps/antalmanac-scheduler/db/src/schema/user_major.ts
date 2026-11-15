import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from './auth';

export const userMajors = pgTable(
    'user_majors',
    {
        user_Id: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        majorId: text('major_id').notNull(), // Anteater API major id (.e.g. "BS-201")
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.user_Id, table.majorId] })]
);

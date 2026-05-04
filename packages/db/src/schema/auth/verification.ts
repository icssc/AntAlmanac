import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const verifications = pgTable('verifications', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { precision: 6, withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { precision: 6, withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { precision: 6, withTimezone: true }).notNull(),
});

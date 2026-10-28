import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

export type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

export type Database = Omit<typeof db, '$client'>;

/**
 * Accepts either the root db or an open transaction, so query helpers can be reused inside a caller's transaction.
 *
 * Use this when the function behaves correctly whether it's given a db or a tx.
 */
export type DatabaseOrTransaction = Database | Transaction;

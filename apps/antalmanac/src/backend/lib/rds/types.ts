import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

export type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
/**
 * Accepts either the root db or an open transaction, so query helpers can be reused inside a caller's transaction.
 *
 * Only use this for functions that behave the same with either. Take `Database` instead if the function:
 * - calls `.transaction()` (on a `Transaction` this becomes a nested savepoint)
 * - catches a DB error and continues (a transaction is aborted after any error, so later queries fail)
 * - relies on row locks such as `.for('update')` (locks are released immediately outside a transaction)
 */
export type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

/**
 * The root db only. Use this for functions that open their own transaction with `.transaction()`.
 */
export type Database = Omit<typeof db, '$client'>;

import type { db } from '@packages/db';
import type * as schema from '@packages/db/src/schema';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

export type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
export type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

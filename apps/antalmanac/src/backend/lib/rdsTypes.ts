import { db } from '@packages/db/src/index';
import * as schema from '@packages/db/src/schema';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { PgQueryResultHKT, PgTransaction } from 'drizzle-orm/pg-core';

export type Transaction = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

export type DatabaseOrTransaction = Omit<typeof db, '$client'> | Transaction;

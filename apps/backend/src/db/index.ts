import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from 'src/env';
import * as schema from 'src/db/schema';

const { DATABASE_URL } = env;
export const client = postgres(DATABASE_URL);

export const db = drizzle(client, { schema });

export type Database = typeof db;

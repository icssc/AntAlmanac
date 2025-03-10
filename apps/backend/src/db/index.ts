import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { rdsEnvSchema } from "../env";
import * as schema from './schema/index.js';

const { DB_URL } = rdsEnvSchema.parse(process.env);

export const client = postgres(DB_URL);

export const db = drizzle(client, { schema });

export type Database = typeof db;

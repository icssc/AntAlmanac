import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import env from '../env';
import * as schema from './schema/index.js';

const { DB_URL } = env;

if (!DB_URL) throw new Error("DB_URL not defined")

export const client = postgres(DB_URL);

export const db = drizzle(client, { schema });

export type Database = typeof db;

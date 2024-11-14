import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const url = process.env.DB_URL;

if (!url) throw new Error("DB_URL not defined")

export const client = postgres(url);

export const db = drizzle(client, { schema });

export type Database = typeof db;

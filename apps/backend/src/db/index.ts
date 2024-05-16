import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const client = postgres('postgres://postgres:postgres@localhost:5432/antalmanac');

export const db = drizzle(client);

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema/index';

const pool = new Pool({
    connectionString: process.env.DB_URL,
    max: 3,
});

export const db = drizzle(pool, { schema });

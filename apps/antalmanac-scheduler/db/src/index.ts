import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from './env';
import * as schema from './schema/index';

const pool = new Pool({
    connectionString: env.DB_URL,
    // Lambda processes one request at a time per runtime environment.
    // We then give some leeway to allow, to a limited extent, concurrent queries.
    // But these are an antipattern and do not deserve first class support, so the limit remains low.
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });

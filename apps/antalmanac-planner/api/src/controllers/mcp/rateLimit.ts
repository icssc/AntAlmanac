/**
 * Per-user daily rate limiting for MCP tool calls.
 *
 * Tracked with two columns on `user` (`mcp_request_count`, `mcp_request_day`). A single
 * atomic statement increments the counter, resetting it to 1 the first time a request is
 * seen on a new UTC day — no separate table, no cleanup job, and correct under concurrent
 * (stateless Lambda) invocations because the read and write happen in one statement.
 * @module
 */

import { sql } from 'drizzle-orm';

import { db } from '../../db';
import { MCP_DAILY_REQUEST_LIMIT } from './config';

export interface RateLimitResult {
    allowed: boolean;
    count: number;
    limit: number;
}

/** UTC midnight after now — when the quota resets. */
export function nextResetDate(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

/**
 * Atomically count this request against the user's daily quota.
 * Returns whether the call is allowed and the running count for the UTC day.
 */
export async function consumeRateLimit(userId: number): Promise<RateLimitResult> {
    const result = await db.execute(sql`
    UPDATE "user"
    SET mcp_request_count = CASE
          WHEN mcp_request_day = (now() AT TIME ZONE 'UTC')::date THEN mcp_request_count + 1
          ELSE 1
        END,
        mcp_request_day = (now() AT TIME ZONE 'UTC')::date
    WHERE id = ${userId}
    RETURNING mcp_request_count AS count
  `);
    const rows = result.rows as { count: number }[];
    const count = Number(rows[0]?.count ?? 0);
    return { allowed: count > 0 && count <= MCP_DAILY_REQUEST_LIMIT, count, limit: MCP_DAILY_REQUEST_LIMIT };
}

/**
 * Shared plumbing for MCP tool handlers: the result helpers and the `guard` wrapper that
 * every tool runs through (authenticate → rate-limit → execute).
 * @module
 */

import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type { ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js';

import { userIdFromAuthInfo } from '../provider';
import { consumeRateLimit, nextResetDate } from '../rateLimit';

export type Extra = RequestHandlerExtra<ServerRequest, ServerNotification>;
export type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

export function ok(data: unknown): ToolResult {
    return { content: [{ type: 'text', text: JSON.stringify(data ?? null, null, 2) }] };
}

export function err(message: string): ToolResult {
    return { content: [{ type: 'text', text: message }], isError: true };
}

/** Best-effort human-readable message for an unknown thrown value, never empty. */
function errorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    // Some driver errors (e.g. pg's AggregateError on ECONNREFUSED) carry an empty message
    // but a useful `code`; surface that instead of a blank string.
    if (error && typeof error === 'object' && 'code' in error && (error as { code?: unknown }).code) {
        return `Tool execution failed (${String((error as { code: unknown }).code)}).`;
    }
    return 'Tool execution failed.';
}

/**
 * Authenticate + rate-limit, then run `fn` with the student's user id. Centralizes the
 * checks every tool needs so individual tools stay one-liners. The rate-limit call and the
 * tool body share one try/catch so an infrastructure failure (e.g. the database being
 * unreachable) surfaces a readable message rather than an empty error.
 */
export async function guard(extra: Extra, fn: (userId: number) => Promise<unknown>): Promise<ToolResult> {
    const userId = userIdFromAuthInfo(extra.authInfo);
    if (userId === undefined) return err('Not authenticated.');

    try {
        const rl = await consumeRateLimit(userId);
        if (!rl.allowed) {
            return err(
                `Daily MCP request limit reached (${rl.limit} requests/day). Quota resets at ${nextResetDate().toISOString()}.`
            );
        }
        return ok(await fn(userId));
    } catch (error) {
        return err(errorMessage(error));
    }
}

/**
 * Bridges an authenticated MCP user to a tRPC caller so MCP tools can reuse the existing
 * procedures (`roadmaps.get`, `search.get`, ...) without duplicating any logic.
 * @module
 */

import { appRouter } from '..';
import type { Context } from '../../helpers/trpc';

/**
 * Build a minimal tRPC {@link Context} for a given user id. Only `session.userId` is read by
 * `userProcedure`; the Anteater-proxying procedures are public and ignore the context.
 */
function buildMcpContext(userId: number): Context {
    return {
        req: new Request('http://localhost/planner/api/mcp'),
        session: { userId },
    };
}

/** A tRPC caller scoped to the authenticated MCP student. */
export function mcpCaller(userId: number) {
    return appRouter.createCaller(buildMcpContext(userId));
}

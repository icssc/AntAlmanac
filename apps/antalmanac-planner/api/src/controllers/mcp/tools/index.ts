/**
 * Registers every MCP tool group on a server instance.
 * @module
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerCourseDataTools } from './courseData';
import { registerPlanReadTools } from './planRead';
import { registerPlanWriteTools } from './planWrite';
import { registerSchedulerTools } from './scheduler';

/** Register all tools (student plan read/write + Anteater course data) on the server. */
export function registerTools(server: McpServer): void {
    registerPlanReadTools(server);
    registerPlanWriteTools(server);
    registerCourseDataTools(server);
    registerSchedulerTools(server);
}

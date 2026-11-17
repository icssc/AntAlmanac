/**
 * Read-only MCP tools over the authenticated student's own plan data.
 * @module
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { mcpCaller } from '../context';
import { guard, type Extra } from './shared';

export function registerPlanReadTools(server: McpServer): void {
    server.registerTool(
        'get_roadmap',
        {
            title: 'Get roadmap',
            description:
                "The authenticated student's multi-year course plan: planners, each with years → " +
                'quarters → courses. Returns null if the student has no roadmap yet.',
        },
        (extra: Extra) => guard(extra, (userId) => mcpCaller(userId).roadmaps.get())
    );

    server.registerTool(
        'get_saved_courses',
        {
            title: 'Get saved courses',
            description: "Course IDs the student has bookmarked/saved (e.g. ['COMPSCI161', 'MATH2B']).",
        },
        (extra: Extra) => guard(extra, (userId) => mcpCaller(userId).savedCourses.get())
    );

    server.registerTool(
        'get_transfer_credits',
        {
            title: 'Get transfer credits',
            description:
                "The student's transfer credit: transferred courses, AP exams, and GE categories satisfied by transfer.",
        },
        (extra: Extra) =>
            guard(extra, async (userId) => {
                const caller = mcpCaller(userId);
                const [courses, apExams, ges] = await Promise.all([
                    caller.transferCredits.getTransferredCourses(),
                    caller.transferCredits.getSavedAPExams(),
                    caller.transferCredits.getTransferredGEs(),
                ]);
                return { courses, apExams, ges };
            })
    );
}

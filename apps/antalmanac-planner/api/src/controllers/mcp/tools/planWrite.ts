/**
 * MCP tools that modify the student's plan. To protect real planners, writes are confined to
 * roadmaps whose name starts with "ai" (see {@link ../roadmapWrite}).
 * @module
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// The MCP SDK's registerTool typing is pathologically slow with zod's v3 API (TS2589 / tsc OOM),
// so tool schemas use the v4 API bundled with zod 3.25.
import { z } from 'zod/v4';

import {
    addCourseToPlan,
    createAiPlanner,
    DEFAULT_AI_PLANNER_NAME,
    QUARTER_NAMES,
    removeCourseFromPlan,
} from '../roadmapWrite';
import { academicYearSchema, courseIdSchema } from './schemas';
import { guard, type Extra } from './shared';

export function registerPlanWriteTools(server: McpServer): void {
    server.registerTool(
        'create_ai_planner',
        {
            title: 'Create AI roadmap',
            description:
                'Create (or return) a roadmap the agent is allowed to edit. To protect the student’s ' +
                'own planners, agent edits are confined to roadmaps whose name starts with "ai"; any ' +
                'name given here is coerced into that namespace (e.g. "fall plan" → "ai-fall plan"). ' +
                'Defaults to "ai-roadmap".',
            inputSchema: {
                name: z
                    .string()
                    .optional()
                    .describe('Planner name; coerced to start with "ai". Defaults to "ai-roadmap".'),
            },
        },
        (args, extra: Extra) => guard(extra, (userId) => createAiPlanner(userId, args.name ?? DEFAULT_AI_PLANNER_NAME))
    );

    server.registerTool(
        'add_course_to_plan',
        {
            title: 'Add course to AI roadmap',
            description:
                'Add a course to a specific academic year + quarter. Only roadmaps whose name starts ' +
                'with "ai" can be modified; if the student has none, "ai-roadmap" is created automatically. ' +
                'The year and quarter are created if missing. Idempotent — adding a course already present ' +
                'is a no-op. Returns the updated roadmap.',
            inputSchema: {
                courseId: courseIdSchema,
                year: academicYearSchema,
                quarter: z.enum(QUARTER_NAMES),
                plannerName: z
                    .string()
                    .optional()
                    .describe('Target roadmap name (must start with "ai"). Defaults to your AI roadmap.'),
            },
        },
        (args, extra: Extra) => guard(extra, (userId) => addCourseToPlan(userId, args))
    );

    server.registerTool(
        'remove_course_from_plan',
        {
            title: 'Remove course from AI roadmap',
            description:
                'Remove a course from a year + quarter. Only "ai"-prefixed roadmaps can be modified. ' +
                'Returns whether a course was removed and the updated roadmap.',
            inputSchema: {
                courseId: courseIdSchema,
                year: academicYearSchema,
                quarter: z.enum(QUARTER_NAMES),
                plannerName: z.string().optional().describe('Target roadmap name (must start with "ai").'),
            },
        },
        (args, extra: Extra) => guard(extra, (userId) => removeCourseFromPlan(userId, args))
    );
}

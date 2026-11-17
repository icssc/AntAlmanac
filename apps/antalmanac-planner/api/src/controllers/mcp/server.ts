/**
 * Builds the MCP server exposed to external AI agents and registers its tools.
 *
 * Tools fall into three groups, all thin wrappers over existing tRPC procedures (via
 * {@link mcpCaller}): the authenticated student's own plan data (read), guarded plan writes,
 * and Anteater API course data. The tool definitions live in {@link ./tools}; every call is
 * authenticated (the student's user id comes from the verified bearer token) and counted
 * against the daily quota (see the `guard` wrapper in {@link ./tools/shared}).
 * @module
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerTools } from './tools';

export function createMcpServer(): McpServer {
    const server = new McpServer(
        { name: 'antalmanac-planner', version: '1.0.0' },
        {
            instructions:
                'Tools for helping a UCI student plan their courses. Read tools (get_roadmap, ' +
                'get_saved_courses, get_transfer_credits) expose the authenticated student’s own data. ' +
                'Write tools (add_course_to_plan, remove_course_from_plan, create_ai_planner) may ONLY ' +
                'modify roadmaps whose name starts with "ai" — never the student’s own planners; if no ' +
                'such roadmap exists, "ai-roadmap" is created automatically. Course tools (search_courses, ' +
                'get_course_details, get_course_grades, get_prerequisites, get_degree_requirements, ' +
                'get_professor, get_current_term, get_section_schedule, list_departments) query UCI course ' +
                'data via the Anteater API. Course IDs are formatted like "COMPSCI161" (department + ' +
                'number, no spaces). An academic year is identified by its start year (e.g. 2024 = 2024–2025). ' +
                'Scheduler tools (get_schedules, get_schedule, search_sections, create_ai_schedule, ' +
                'update_ai_schedule) search WebSOC offerings and access your verified scheduler account ' +
                'matched by your planner email. Only schedules whose current trimmed name starts with ' +
                '"ai" (case-insensitive) may be edited. Saving a schedule does not enroll you in classes.',
        }
    );

    registerTools(server);

    return server;
}

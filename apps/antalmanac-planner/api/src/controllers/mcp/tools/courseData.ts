/**
 * MCP tools that query UCI course data via the Anteater-backed tRPC procedures. These are
 * public (they ignore the caller's identity) but still run through {@link guard} for
 * authentication and rate limiting.
 * @module
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// The MCP SDK's registerTool typing is pathologically slow with zod's v3 API (TS2589 / tsc OOM),
// so tool schemas use the v4 API bundled with zod 3.25.
import { z } from 'zod/v4';

import { mcpCaller } from '../context';
import { courseIdSchema, gradeQuarterSchema } from './schemas';
import { guard, type Extra } from './shared';

export function registerCourseDataTools(server: McpServer): void {
    server.registerTool(
        'search_courses',
        {
            title: 'Search courses or instructors',
            description:
                'Fuzzy search UCI courses or instructors. Use resultType "course" or "instructor". ' +
                'Supports optional filters (department, courseLevel, unit range, GE category).',
            inputSchema: {
                query: z.string().describe('Search text, e.g. "intro to programming" or "COMPSCI 161".'),
                resultType: z.enum(['course', 'instructor']).default('course'),
                skip: z.number().int().min(0).default(0).describe('Results to skip (pagination).'),
                take: z.number().int().min(1).max(100).default(10).describe('Number of results to return.'),
                department: z.string().optional().describe('Department code filter, e.g. "COMPSCI".'),
                courseLevel: z.string().optional(),
                minUnits: z.number().int().optional(),
                maxUnits: z.number().int().optional(),
                ge: z.string().optional().describe('GE category filter, e.g. "GE-2".'),
            },
        },
        (args, extra: Extra) => guard(extra, (userId) => mcpCaller(userId).search.get(args))
    );

    server.registerTool(
        'get_course_details',
        {
            title: 'Get course details',
            description:
                'Full details for one course (title, description, units, prerequisites, terms offered) ' +
                'by course ID, e.g. "COMPSCI161".',
            inputSchema: { courseID: courseIdSchema },
        },
        (args, extra: Extra) => guard(extra, (userId) => mcpCaller(userId).courses.get(args))
    );

    server.registerTool(
        'get_course_grades',
        {
            title: 'Get course grades by instructor',
            description:
                'Historical grade distribution for a course, pre-aggregated per instructor: averageGPA plus ' +
                'A–F / P / NP / W counts. Compact and ideal for comparing professors ("who grades easiest"). ' +
                'Optionally filter by instructor (e.g. "KIM, J."), year, and/or quarter.',
            inputSchema: {
                department: z.string().describe('Department code, e.g. "COMPSCI".'),
                number: z.string().describe('Course number, e.g. "161".'),
                instructor: z
                    .string()
                    .optional()
                    .describe('Instructor name filter, case-insensitive, e.g. "SHINDLER, M.".'),
                year: z.string().optional().describe('Academic year filter, e.g. "2024".'),
                quarter: gradeQuarterSchema.optional(),
            },
        },
        (args, extra: Extra) => guard(extra, (userId) => mcpCaller(userId).courses.gradesByInstructor(args))
    );

    server.registerTool(
        'get_prerequisites',
        {
            title: 'Get course prerequisites',
            description:
                'The prerequisite tree and prerequisite list for a course (extracted from its details), ' +
                'by course ID, e.g. "COMPSCI161".',
            inputSchema: { courseID: courseIdSchema },
        },
        (args, extra: Extra) =>
            guard(extra, async (userId) => {
                const course = await mcpCaller(userId).courses.get(args);
                return {
                    id: course?.id,
                    title: course?.title,
                    prerequisiteText: course?.prerequisiteText,
                    prerequisiteTree: course?.prerequisiteTree,
                    prerequisites: course?.prerequisites,
                    dependencies: course?.dependencies,
                };
            })
    );

    server.registerTool(
        'get_degree_requirements',
        {
            title: 'Get degree requirements',
            description:
                'Required courses for a degree program. For a major/minor/specialization, pass its ' +
                'programId (and specializationId for a major specialization). For university-wide ' +
                'requirements, use type "ugrad" with ugradId one of UC, GE, CHC4, CHC2.',
            inputSchema: {
                type: z.enum(['major', 'minor', 'specialization', 'ugrad']),
                programId: z.string().optional().describe('Program id for major/minor/specialization.'),
                specializationId: z.string().optional().describe('Specialization id for a major.'),
                ugradId: z.enum(['UC', 'GE', 'CHC4', 'CHC2']).optional().describe('Required when type is "ugrad".'),
            },
        },
        (args, extra: Extra) =>
            guard(extra, (userId) => {
                const caller = mcpCaller(userId);
                if (args.type === 'ugrad') {
                    if (!args.ugradId) throw new Error('ugradId is required when type is "ugrad".');
                    return caller.programs.getRequiredCoursesUgrad({ id: args.ugradId });
                }
                if (!args.programId) throw new Error('programId is required for major/minor/specialization.');
                return caller.programs.getRequiredCourses({
                    type: args.type,
                    programId: args.programId,
                    specializationId: args.specializationId,
                });
            })
    );

    server.registerTool(
        'get_professor',
        {
            title: 'Get professor',
            description: 'Instructor details (courses taught, schools, etc.) by UCInetID.',
            inputSchema: { ucinetid: z.string().describe('Instructor UCInetID, e.g. "mikes".') },
        },
        (args, extra: Extra) => guard(extra, (userId) => mcpCaller(userId).professors.get(args))
    );

    server.registerTool(
        'get_current_term',
        {
            title: 'Get current term',
            description:
                'The current UCI term as "YYYY Quarter" (e.g. "2026 Spring"). Use this to resolve ' +
                '"this/next quarter" before calling get_section_schedule.',
        },
        (extra: Extra) => guard(extra, (userId) => mcpCaller(userId).schedule.currentQuarter())
    );

    server.registerTool(
        'get_section_schedule',
        {
            title: 'Get section schedule (WebSOC)',
            description:
                'Scheduled sections for a course in a term from WebSOC (times, instructors, enrollment). ' +
                'Omit `term` to use the current term (so "when is X offered?" works without guessing). ' +
                'Term format is "YYYY Quarter", e.g. "2024 Fall".',
            inputSchema: {
                department: z.string().describe('Department code, e.g. "COMPSCI".'),
                number: z.string().describe('Course number, e.g. "161".'),
                term: z
                    .string()
                    .optional()
                    .describe('Term as "YYYY Quarter"; defaults to the current term if omitted.'),
            },
        },
        (args, extra: Extra) =>
            guard(extra, async (userId) => {
                const caller = mcpCaller(userId);
                const term = args.term ?? (await caller.schedule.currentQuarter());
                return caller.schedule.getTermDeptNum({ term, department: args.department, number: args.number });
            })
    );

    server.registerTool(
        'list_departments',
        {
            title: 'List departments',
            description: 'All UCI departments offered in the past ~10 years (code + name).',
        },
        (extra: Extra) => guard(extra, (userId) => mcpCaller(userId).departments.get())
    );
}

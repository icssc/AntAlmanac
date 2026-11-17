import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
    CUSTOM_EVENT_TIME_PATTERN,
    WEBSOC_DAYS,
    WEBSOC_RESTRICTION_CODES,
    isCustomEventTimeRangeInvalid,
} from '@packages/antalmanac-types';
import { z } from 'zod/v4';

import { getSchedule, getSchedules, searchSections, writeAiSchedule } from '../scheduler';
import { guard, type Extra } from './shared';

const term = z
    .string()
    .regex(/^\d{4} (Fall|Winter|Spring|Summer1|Summer10wk|Summer2)$/)
    .describe('Term, e.g. "2026 Fall".');
const scheduleId = z
    .string()
    .min(1)
    .describe('Persistent schedule ID returned by get_schedules or create_ai_schedule.');
const eventTime = z
    .string()
    .regex(CUSTOM_EVENT_TIME_PATTERN)
    .describe('Local time as HH:mm, e.g. "10:00". Use an empty string for an unscheduled event.');
const changes = {
    name: z.string().optional().describe('Coerced to start with "ai". Creation defaults to "ai-schedule".'),
    notes: z.string().max(5000).optional(),
    sections: z
        .array(
            z.object({
                term,
                sectionCode: z.string().regex(/^\d{5}$/),
                color: z.string(),
                visibility: z.enum(['visible', 'outlined', 'disappeared']).default('visible'),
            })
        )
        .optional()
        .describe(
            'Section references, using scheduler colors and visibility. Replaces all sections; [] clears them. Duplicate term/code pairs are collapsed.'
        ),
    customEvents: z
        .array(
            z
                .object({
                    customEventID: z.union([z.string(), z.number()]),
                    title: z.string(),
                    start: eventTime,
                    end: eventTime,
                    days: z.array(z.boolean()).length(7).describe('Sunday through Saturday.'),
                    color: z.string().optional(),
                    building: z.string().optional(),
                })
                .refine(
                    (event) => !isCustomEventTimeRangeInvalid(event.start, event.end),
                    'Custom event end time must be after its start time.'
                )
        )
        .optional()
        .describe(
            'Repeating scheduler events. Replaces all custom events; [] clears them. IDs must be unique within the schedule.'
        ),
};

export function registerSchedulerTools(server: McpServer): void {
    server.registerTool(
        'get_schedules',
        {
            title: 'List your scheduler schedules',
            description:
                'Read all schedules owned by your verified scheduler account, including persistent IDs, names, notes, sections, custom events, and editability. Sign into the scheduler with your planner email first.',
        },
        (extra: Extra) => guard(extra, getSchedules)
    );

    server.registerTool(
        'get_schedule',
        {
            title: 'Read your scheduler schedule',
            description:
                'Read one owned schedule by persistent ID, including WebSOC section meetings. Unavailable historical offerings are reported while retaining saved contents.',
            inputSchema: { scheduleId },
        },
        (args, extra: Extra) => guard(extra, (userId) => getSchedule(userId, args.scheduleId))
    );

    server.registerTool(
        'search_sections',
        {
            title: 'Search offered WebSOC sections',
            description:
                'Search actual offered sections with scheduler filter semantics. Returns schools/departments/courses with sections, meetings, instructors and availability. Use search_courses for catalog search. Saving sections does not enroll you.',
            inputSchema: {
                term,
                department: z.string().optional(),
                courseNumber: z.string().optional(),
                courseId: z.string().optional(),
                courseTitle: z.string().optional(),
                sectionCodes: z.string().optional().describe('Comma-separated five-digit section codes.'),
                instructorName: z.string().optional(),
                ge: z.string().optional(),
                days: z.array(z.enum(WEBSOC_DAYS)).default([]),
                startTime: z.string().optional(),
                endTime: z.string().optional(),
                sectionType: z
                    .enum(['Act', 'Col', 'Dis', 'Fld', 'Lab', 'Lec', 'Qiz', 'Res', 'Sem', 'Stu', 'Tap', 'Tut'])
                    .optional(),
                units: z.string().optional(),
                fullCourses: z.enum(['ANY', 'SkipFull', 'SkipFullWaitlist', 'FullOnly', 'Overenrolled']).optional(),
                excludeRestrictionCodes: z.array(z.enum(WEBSOC_RESTRICTION_CODES)).default([]),
                division: z.enum(['LowerDiv', 'UpperDiv', 'Graduate', 'ANY']).optional(),
                cancelledCourses: z.enum(['Exclude', 'Include', 'Only']).optional(),
                building: z.string().optional(),
                room: z.string().optional(),
                includeRelatedCourses: z.string().optional(),
            },
        },
        (args, extra: Extra) => guard(extra, () => searchSections(args))
    );

    server.registerTool(
        'create_ai_schedule',
        {
            title: 'Create AI scheduler schedule',
            description:
                'Create a new schedule in your verified scheduler account and return its persistent ID and contents. Names are coerced into the "ai" namespace. Optional notes, section references and custom events. Saving does not enroll you in classes.',
            inputSchema: changes,
        },
        (args, extra: Extra) => guard(extra, (userId) => writeAiSchedule(userId, args))
    );

    server.registerTool(
        'update_ai_schedule',
        {
            title: 'Edit AI scheduler schedule',
            description:
                'Edit an owned schedule by persistent ID only when its current trimmed name starts with "ai" (case-insensitive). Omitted fields stay unchanged; supplied arrays replace only this schedule\'s corresponding contents, and [] clears them. Renames stay in the "ai" namespace. Saving does not enroll you.',
            inputSchema: { scheduleId, ...changes },
        },
        ({ scheduleId, ...args }, extra: Extra) => guard(extra, (userId) => writeAiSchedule(userId, args, scheduleId))
    );
}

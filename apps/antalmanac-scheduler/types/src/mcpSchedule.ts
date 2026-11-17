import { z } from 'zod';

import { CUSTOM_EVENT_TIME_PATTERN, RepeatingCustomEventSchema, isCustomEventTimeRangeInvalid } from './customEvent';
import { SCHEDULE_NOTE_MAX_LENGTH, ShortCourseSchema } from './schedule';

export const ScheduleTermSchema = z
    .string()
    .regex(/^\d{4} (Fall|Winter|Spring|Summer1|Summer10wk|Summer2)$/, 'Use a term such as "2026 Fall".');

const sectionSchema = ShortCourseSchema.extend({
    term: ScheduleTermSchema,
    sectionCode: z.string().regex(/^\d{5}$/, 'Section codes must contain five digits.'),
});

// Reuse scheduler validation, adding checks needed before writing untrusted tool inputs.
const eventTimeSchema = z
    .string()
    .regex(CUSTOM_EVENT_TIME_PATTERN, 'Use a local HH:mm time, such as "10:00", or an empty string for no time.');
const eventSchema = RepeatingCustomEventSchema.extend({
    days: z.array(z.boolean()).length(7),
    start: eventTimeSchema,
    end: eventTimeSchema,
}).refine(
    (event) => !isCustomEventTimeRangeInvalid(event.start, event.end),
    'Custom event end time must be after its start time.'
);
const sectionsSchema = z
    .array(sectionSchema)
    .transform((sections) => [
        ...new Map(sections.map((section) => [`${section.term}:${section.sectionCode}`, section])).values(),
    ]);
const eventsSchema = z
    .array(eventSchema)
    .refine(
        (events) => new Set(events.map((event) => String(event.customEventID))).size === events.length,
        'Custom event IDs must be unique within a schedule.'
    );

export const AiScheduleChangesSchema = z
    .object({
        name: z.string().optional(),
        notes: z.string().max(SCHEDULE_NOTE_MAX_LENGTH).optional(),
        sections: sectionsSchema.optional(),
        customEvents: eventsSchema.optional(),
    })
    .strict();
export type AiScheduleChanges = z.infer<typeof AiScheduleChangesSchema>;

export function isAiSchedule(name: string | null): boolean {
    return name?.trim().toLowerCase().startsWith('ai') ?? false;
}

export function toAiScheduleName(name = 'ai-schedule'): string {
    const trimmed = name.trim();
    if (!trimmed) return 'ai-schedule';
    return isAiSchedule(trimmed) ? trimmed : `ai-${trimmed}`;
}

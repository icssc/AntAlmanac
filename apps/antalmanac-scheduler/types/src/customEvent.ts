import { z } from 'zod';

/** Repeating events store local HH:mm times; empty times are supported for unscheduled events. */
export const CUSTOM_EVENT_TIME_PATTERN = /^(?:([01]\d|2[0-3]):[0-5]\d)?$/;

export function isCustomEventTimeRangeInvalid(start: string, end: string): boolean {
    return start !== '' && end !== '' && start >= end;
}

export const RepeatingCustomEventSchema = z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
    days: z.array(z.boolean()),
    customEventID: z.union([z.string(), z.number()]), // Unique only within the schedule.
    color: z.string().optional(),
    building: z.string().optional(),
});

export type RepeatingCustomEvent = z.infer<typeof RepeatingCustomEventSchema>;

export type CustomEventId = RepeatingCustomEvent['customEventID'];

import { z } from 'zod';

export const CUSTOM_EVENT_NOTES_MAX_LENGTH = 500; // adjust if needed to fit

export const RepeatingCustomEventSchema = z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
    days: z.array(z.boolean()),
    customEventID: z.union([z.string(), z.number()]), // Unique only within the schedule.
    color: z.string().optional(),
    building: z.string().optional(),
    notes: z.string().trim().max(CUSTOM_EVENT_NOTES_MAX_LENGTH).optional(),
});

export type RepeatingCustomEvent = z.infer<typeof RepeatingCustomEventSchema>;

/** Trims notes and collapses empty/whitespace-only notes to `undefined`. */
export function normalizeCustomEventNotes(notes: string | undefined): string | undefined {
    return notes?.trim() || undefined;
}

export type CustomEventId = RepeatingCustomEvent['customEventID'];

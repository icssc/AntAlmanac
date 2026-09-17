import { z } from 'zod';

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

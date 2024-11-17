import { type } from 'arktype';

export const RepeatingCustomEventSchema = type({
    title: 'string',
    start: 'string',
    end: 'string',
    days: 'boolean[]',
    customEventID: 'number | parsedNumber', // Unique only within the schedule.
    'color?': 'string',
    'building?': 'string | undefined',
});

export type RepeatingCustomEvent = typeof RepeatingCustomEventSchema.infer;

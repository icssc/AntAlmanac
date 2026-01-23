import { type } from 'arktype';

export const RepeatingCustomEventSchema = type({
    title: 'string',
    start: 'string',
    end: 'string',
    days: 'boolean[]',
    customEventID: 'string | number', // Unique only within the schedule.
    'color?': 'string',
    'building?': 'string | undefined',
});

// Explicit TypeScript types to avoid depending on schema inference which can
// produce incompatible literal types under stricter TS settings.
export type RepeatingCustomEvent = {
    title: string;
    start: string;
    end: string;
    days: boolean[];
    customEventID: string | number;
    color?: string;
    building?: string | undefined;
};

export type CustomEventId = string | number;

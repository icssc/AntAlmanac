import { type } from 'arktype';

export const RepeatingCustomEventSchema = type({
    title: 'string',
    start: 'string',
    end: 'string',
    days: 'boolean[]',
    customEventID: 'number | parsedNumber',
    'color?': 'string',
});

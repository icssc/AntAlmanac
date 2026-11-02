import { calendarizeCustomEvents } from '$stores/calendarizeHelpers';
import {
    CUSTOM_EVENT_NOTES_MAX_LENGTH,
    type RepeatingCustomEvent,
    RepeatingCustomEventSchema,
} from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

describe('Custom Events', () => {
    const customEvent: RepeatingCustomEvent = {
        title: 'placeHoldertitle',
        start: '10:30',
        end: '13:30',
        days: [false, false, true, false, false, false, false],
        customEventID: '999',
        color: 'placeholderColor',
        building: undefined,
    };

    test('schema does not throw error when building property exists and is undefined', async () => {
        expect(() => RepeatingCustomEventSchema.parse(customEvent)).not.toThrowError();
    });

    test('schema keeps notes and trims surrounding whitespace', () => {
        expect(RepeatingCustomEventSchema.parse({ ...customEvent, notes: '  ROOM 100\n' }).notes).toBe('ROOM 100');
        expect(RepeatingCustomEventSchema.parse({ ...customEvent, notes: ' \n ' }).notes).toBe('');
    });

    test('schema rejects notes over the max length', () => {
        const notes = 'a'.repeat(CUSTOM_EVENT_NOTES_MAX_LENGTH + 1);
        expect(() => RepeatingCustomEventSchema.parse({ ...customEvent, notes })).toThrowError();
    });

    test('calendarizeCustomEvents carries notes onto each calendar event', () => {
        const result = calendarizeCustomEvents([{ ...customEvent, notes: 'ROOM 100' }]);
        expect(result.map((event) => event.notes)).toEqual(['ROOM 100']);
    });
});

import { isScheduleContentEmpty } from '$lib/scheduleContentEmpty';
import { describe, expect, it } from 'vitest';

describe('isScheduleContentEmpty', () => {
    it('is true only when there are no courses, custom events, or note', () => {
        expect(isScheduleContentEmpty({ courses: [], customEvents: [], scheduleNote: '' })).toBe(true);

        expect(
            isScheduleContentEmpty({
                courses: [{ x: 1 } as never],
                customEvents: [],
                scheduleNote: '',
            })
        ).toBe(false);

        expect(
            isScheduleContentEmpty({
                courses: [],
                customEvents: [{ y: 1 } as never],
                scheduleNote: '',
            })
        ).toBe(false);

        expect(
            isScheduleContentEmpty({
                courses: [],
                customEvents: [],
                scheduleNote: 'hello',
            })
        ).toBe(false);
    });
});

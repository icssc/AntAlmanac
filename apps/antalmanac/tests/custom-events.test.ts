import { describe, test, expect } from 'vitest';
import { RepeatingCustomEvent, RepeatingCustomEventSchema } from '@packages/antalmanac-types';

describe('Custom Events', () => {
    const customEvent: RepeatingCustomEvent = {
        title: 'placeHoldertitle',
        start: '10:30',
        end: '13:30',
        days: [false, false, true, false, false, false, false],
        customEventID: 999,
        color: 'placeholderColor',
        building: undefined,
    };

    test('schema does not throw error when building property exists and is undefined', async () => {
        expect(() => RepeatingCustomEventSchema.assert(customEvent)).not.toThrowError();
    });
});

import { describe, test, expect } from 'vitest';
import { Schedules } from '$stores/Schedules';

describe('schedule logic', () => {
    const scheduleStore = new Schedules();

    test('no error when loading undefined schedule', () => {
        expect(() => scheduleStore.getScheduleName(69)).not.toThrowError();
    });
});

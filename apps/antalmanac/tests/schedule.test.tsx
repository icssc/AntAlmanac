import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Schedules } from '../src/stores/Schedules';
import RenameScheduleDialog from '$components/dialogs/RenameSchedule';

describe('schedule logic', () => {
    const scheduleStore = new Schedules();

    test('no error when loading undefined schedule', () => {
        expect(() => scheduleStore.getScheduleName(100)).not.toThrowError();
    });

    test('does not error if schedule name is undefined', () => {
        expect(() => render(<RenameScheduleDialog index={100} open={true} />)).not.toThrowError();
    });
});

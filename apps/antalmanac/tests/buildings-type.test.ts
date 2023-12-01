import { describe, test, expect } from 'vitest';
import { RepeatingCustomEvent } from '@packages/antalmanac-types';
import AppStore from '$stores/AppStore';
import trpc from '$lib/api/trpc';

describe('building type', () => {
    const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
    const customEvent: RepeatingCustomEvent = {
        title: 'placeHoldertitle',
        start: '10:30',
        end: '13:30',
        days: [false, false, true, false, false, false, false],
        customEventID: 999,
        color: 'placeholderColor',
        building: undefined,
    };

    AppStore.addCustomEvent(customEvent, [0]);

    test('schema does not throw error when building property exists and is undefined', async () => {
        expect(
            await trpc.users.saveUserData.mutate({ id: 'testUser', userData: scheduleSaveState })
        ).not.toThrowError();
    });
});

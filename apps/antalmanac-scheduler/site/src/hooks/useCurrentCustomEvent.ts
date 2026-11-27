import AppStore from '$stores/AppStore';
import type { CustomEventId, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { useEffect, useState } from 'react';

function findInCurrentSchedule(customEventID: CustomEventId): RepeatingCustomEvent | undefined {
    const customEvent = AppStore.schedule
        .getCurrentCustomEvents()
        .find((event) => event.customEventID === customEventID);
    // The store edits custom events in place, so return a copy to give React a new value to re-render with.
    return customEvent ? { ...customEvent } : undefined;
}

export function useCurrentCustomEvent(customEventID: CustomEventId): RepeatingCustomEvent | undefined {
    const [customEvent, setCustomEvent] = useState(() => findInCurrentSchedule(customEventID));

    useEffect(() => {
        const update = () => setCustomEvent(findInCurrentSchedule(customEventID));
        update();

        AppStore.on('customEventsChange', update);
        AppStore.on('colorChange', update);
        AppStore.on('currentScheduleIndexChange', update);

        return () => {
            AppStore.off('customEventsChange', update);
            AppStore.off('colorChange', update);
            AppStore.off('currentScheduleIndexChange', update);
        };
    }, [customEventID]);

    return customEvent;
}

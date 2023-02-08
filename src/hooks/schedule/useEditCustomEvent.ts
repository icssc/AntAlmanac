import { RepeatingCustomEvent } from '../../types';
import { useScheduleStore } from '$lib/stores/schedule';

export function useEditCustomEvent(newCustomEvent: RepeatingCustomEvent) {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const editCustomEvent = useScheduleStore((state) => state.editCustomEvent);
  const customEventsAfterEdit = customEvents.map((customEvent) => {
    if (newCustomEvent.customEventID !== customEvent.customEventID) return customEvent;
    else return newCustomEvent;
  });
  editCustomEvent(customEventsAfterEdit);
}

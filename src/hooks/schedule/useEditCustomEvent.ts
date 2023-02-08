import { RepeatingCustomEvent } from '../../types';
import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to edit a custom event
 */
export default function useEditCustomEvent() {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const editCustomEvent = useScheduleStore((state) => state.editCustomEvent);

  return (newCustomEvent: RepeatingCustomEvent) => {
    const customEventsAfterEdit = customEvents.map((customEvent) => {
      if (newCustomEvent.customEventID !== customEvent.customEventID) return customEvent;
      else return newCustomEvent;
    });
    editCustomEvent(customEventsAfterEdit);
  };
}

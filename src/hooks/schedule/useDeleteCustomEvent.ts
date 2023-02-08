import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to deltete a custom event
 */
export default function useDeleteCustomEvent() {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const deleteCustomEvent = useScheduleStore((state) => state.deleteCustomEvent);

  return (customEventID: number, scheduleIndex: number) => {
    const customEventsAfterDelete = customEvents.filter((customEvent) => {
      if (customEvent.customEventID === customEventID) {
        if (customEvent.scheduleIndices.length === 1) {
          return false;
        } else {
          customEvent.scheduleIndices = customEvent.scheduleIndices.filter((index) => index !== scheduleIndex);

          return true;
        }
      }
      return true;
    });
    deleteCustomEvent(customEventsAfterDelete);
  };
}

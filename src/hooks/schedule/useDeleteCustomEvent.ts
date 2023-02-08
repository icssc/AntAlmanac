import { useScheduleStore } from '$lib/stores/schedule';

export function useDeleteCustomEvent(customEventID: number, scheduleIndex: number) {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const deleteCustomEvent = useScheduleStore((state) => state.deleteCustomEvent);

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
}

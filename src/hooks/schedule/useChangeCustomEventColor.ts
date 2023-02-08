import { useScheduleStore } from '$lib/stores/schedule';

export function useChangeCustomEventColor(customEventID: number, newColor: string) {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const changeCustomEventColor = useScheduleStore((state) => state.changeCustomEventColor);

  const customEventsAfterColorChange = customEvents.map((customEvent) => {
    if (customEvent.customEventID === customEventID) {
      return { ...customEvent, color: newColor };
    } else {
      return customEvent;
    }
  });

  changeCustomEventColor(customEventsAfterColorChange, customEventID, newColor);
}

import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to change a custom event's color
 */
export default function useChangeCustomEventColor() {
  const customEvents = useScheduleStore((state) => state.customEvents);
  const changeCustomEventColor = useScheduleStore((state) => state.changeCustomEventColor);

  return (customEventID: number, newColor: string) => {
    const customEventsAfterColorChange = customEvents.map((customEvent) => {
      if (customEvent.customEventID === customEventID) {
        return { ...customEvent, color: newColor };
      } else {
        return customEvent;
      }
    });

    changeCustomEventColor(customEventsAfterColorChange, customEventID, newColor);
  };
}

import { RepeatingCustomEvent } from '../../types';
import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to add a new custom event
 */
export default function useAddCustomEvent() {
  const addCustomEvent = useScheduleStore((state) => state.addCustomEvent);

  return (customEvent: RepeatingCustomEvent) => {
    addCustomEvent(customEvent);
  };
}

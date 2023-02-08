import { RepeatingCustomEvent } from '../../types';
import { useScheduleStore } from '$lib/stores/schedule';

export function useAddCustomEvent(customEvent: RepeatingCustomEvent) {
  const addCustomEvent = useScheduleStore((state) => state.addCustomEvent);
  addCustomEvent(customEvent);
}

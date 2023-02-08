import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to add a schedule
 */
export default function useAddSchedule() {
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const addSchedule = useScheduleStore((state) => state.addSchedule);

  return (scheduleName: string) => {
    const newScheduleNames = [...scheduleNames, scheduleName];
    addSchedule(newScheduleNames);
  };
}

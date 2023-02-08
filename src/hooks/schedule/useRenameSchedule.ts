import { useScheduleStore } from '$lib/stores/schedule';

/**
 * hook that adds a handler to the schedule store
 * @returns a function that will invoke the handler to rename a schedule
 */
export default function useRenameSchedule() {
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const renameSchedule = useScheduleStore((state) => state.renameSchedule);

  return (scheduleName: string, scheduleIndex: number) => {
    const newScheduleNames = [...scheduleNames];
    newScheduleNames[scheduleIndex] = scheduleName;
    renameSchedule(newScheduleNames);
  };
}

import { useScheduleStore } from '$lib/stores/schedule';

export function useRenameSchedule(scheduleName: string, scheduleIndex: number) {
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const renameSchedule = useScheduleStore((state) => state.renameSchedule);
  const newScheduleNames = [...scheduleNames];
  newScheduleNames[scheduleIndex] = scheduleName;
  renameSchedule(newScheduleNames);
}

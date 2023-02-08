import { useScheduleStore } from '$lib/stores/schedule';

export function useAddSchedule(scheduleName: string) {
  const scheduleNames = useScheduleStore((state) => state.scheduleNames);
  const addSchedule = useScheduleStore((state) => state.addSchedule);

  const newScheduleNames = [...scheduleNames, scheduleName];
  addSchedule(newScheduleNames);
}

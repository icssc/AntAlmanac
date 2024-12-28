import { ShortCourseSchedule } from '@packages/antalmanac-types';

/**
 * 
 * @param scheduleName The original schedule name
 * @param nameCounts A map of schedule names to the number of times they've been used
 * @returns A schedule name with `(NUM)` appended to it if it's a duplicate
 */
function makeNonDuplicateScheduleName(
    scheduleName: string,
    nameCounts: Map<string, number>
): string {
    const count = nameCounts.get(scheduleName) ?? 0;
    nameCounts.set(scheduleName, count + 1);
    return scheduleName + (count > 0 ? ` (${count})` : '');
}

/**
 * Convert a list of schedules to use non-duplicate schedule names by
 * appending `(NUM)` to the end of duplicate schedule names.
 * 
 * Example: ['Winter 2022', 'Winter 2022', 'Spring 2022'] -> ['Winter 2022', 'Winter 2022 (1)', 'Spring 2022']
 */
export function mangleDupliateScheduleNames(
    schedules: ShortCourseSchedule[]
): ShortCourseSchedule[] {
    const scheduleNameCounts = new Map<string, number>();

    return schedules.map(
        (schedule, i) => ({ 
            ...schedule, 
            scheduleName: makeNonDuplicateScheduleName(schedule.scheduleName, scheduleNameCounts) 
        })
    );
}

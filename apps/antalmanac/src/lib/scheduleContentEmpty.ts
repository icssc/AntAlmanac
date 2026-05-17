/**
 * True when a schedule slice has nothing the user added (courses, custom events, or a note).
 * Matches the per-schedule checks used for save/import empty detection.
 */
export function isScheduleContentEmpty(schedule: {
    courses: { readonly length: number };
    customEvents: { readonly length: number };
    scheduleNote: string;
}): boolean {
    return schedule.courses.length === 0 && schedule.customEvents.length === 0 && schedule.scheduleNote === '';
}

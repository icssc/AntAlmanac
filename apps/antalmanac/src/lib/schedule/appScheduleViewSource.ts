import { changeCurrentSchedule } from '$actions/AppStoreActions';
import type { ScheduleViewSource } from '$lib/schedule/ScheduleViewSource';
import AppStore from '$stores/AppStore';

const APP_STORE_EVENTS = [
    'addedCoursesChange',
    'customEventsChange',
    'colorChange',
    'currentScheduleIndexChange',
    'scheduleNamesChange',
    'scheduleNotesChange',
] as const;

export const appScheduleViewSource: ScheduleViewSource = {
    scope: 'home',
    readonly: false,
    appliesCourseVisibility: true,

    get schedule() {
        return AppStore.schedule;
    },

    getScheduleNames: () => AppStore.getScheduleNames(),
    getCurrentScheduleIndex: () => AppStore.getCurrentScheduleIndex(),
    getCurrentScheduleId: () => AppStore.getCurrentScheduleId(),
    getEventsInCalendar: () => AppStore.getEventsInCalendar(),
    getFinalEventsInCalendar: () => AppStore.getFinalEventsInCalendar(),
    getCourseEventsInCalendar: () => AppStore.getCourseEventsInCalendar(),
    getCustomEventsInCalendar: () => AppStore.getCustomEventsInCalendar(),
    getCurrentScheduleNote: () => AppStore.getCurrentScheduleNote(),
    getCurrentCustomEvents: () => AppStore.schedule.getCurrentCustomEvents(),

    changeCurrentSchedule: (index) => {
        changeCurrentSchedule(index);
    },

    subscribe: (onChange) => {
        for (const event of APP_STORE_EVENTS) {
            AppStore.on(event, onChange);
        }
        return () => {
            for (const event of APP_STORE_EVENTS) {
                AppStore.off(event, onChange);
            }
        };
    },
};

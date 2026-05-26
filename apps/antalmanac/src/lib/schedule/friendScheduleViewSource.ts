import type { ScheduleViewSource } from '$lib/schedule/ScheduleViewSource';
import FriendsStore from '$stores/FriendsStore';

const FRIEND_STORE_EVENTS = ['friendViewChange', 'scheduleChange'] as const;

export const friendScheduleViewSource: ScheduleViewSource = {
    scope: 'friend',
    readonly: true,
    appliesCourseVisibility: false,

    get schedule() {
        return FriendsStore.schedule;
    },

    getScheduleNames: () => FriendsStore.getFriendScheduleNames(),
    getCurrentScheduleIndex: () => FriendsStore.schedule.getCurrentScheduleIndex(),
    getCurrentScheduleId: () => FriendsStore.schedule.getCurrentScheduleId(),
    getEventsInCalendar: () => FriendsStore.schedule.getCalendarizedEvents(),
    getFinalEventsInCalendar: () => FriendsStore.schedule.getCalendarizedFinals(),
    getCourseEventsInCalendar: () => FriendsStore.schedule.getCalendarizedCourseEvents(),
    getCustomEventsInCalendar: () => FriendsStore.schedule.getCalendarizedCustomEvents(),
    getCurrentScheduleNote: () => FriendsStore.getCurrentFriendSchedule().scheduleNote ?? '',
    getCurrentCustomEvents: () => FriendsStore.getCurrentFriendSchedule().customEvents,

    changeCurrentSchedule: (index) => {
        FriendsStore.changeCurrentSchedule(index);
    },

    subscribe: (onChange) => {
        for (const event of FRIEND_STORE_EVENTS) {
            FriendsStore.on(event, onChange);
        }
        return () => {
            for (const event of FRIEND_STORE_EVENTS) {
                FriendsStore.off(event, onChange);
            }
        };
    },
};

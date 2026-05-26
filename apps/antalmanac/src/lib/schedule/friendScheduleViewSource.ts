import type { ScheduleViewSource } from '$lib/schedule/ScheduleViewSource';
import FriendsStore from '$stores/FriendsStore';

const FRIEND_STORE_EVENTS = ['friendViewChange', 'scheduleChange'] as const;

const friendScheduleListeners = new Set<() => void>();
let unsubscribeFromFriendsStore: (() => void) | null = null;

function notifyFriendScheduleListeners() {
    for (const listener of friendScheduleListeners) {
        listener();
    }
}

function ensureFriendsStoreSubscription() {
    if (unsubscribeFromFriendsStore) {
        return;
    }

    for (const event of FRIEND_STORE_EVENTS) {
        FriendsStore.on(event, notifyFriendScheduleListeners);
    }

    unsubscribeFromFriendsStore = () => {
        for (const event of FRIEND_STORE_EVENTS) {
            FriendsStore.off(event, notifyFriendScheduleListeners);
        }
        unsubscribeFromFriendsStore = null;
    };
}

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
        friendScheduleListeners.add(onChange);
        ensureFriendsStoreSubscription();

        return () => {
            friendScheduleListeners.delete(onChange);
            if (friendScheduleListeners.size === 0 && unsubscribeFromFriendsStore) {
                unsubscribeFromFriendsStore();
            }
        };
    },
};

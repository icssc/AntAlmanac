import { AASection } from '@packages/antalmanac-types';
import { create } from 'zustand';

import { Notifications } from '$lib/notifications';

export type NotificationStatus = {
    openStatus: boolean;
    waitlistStatus: boolean;
    fullStatus: boolean;
    restrictionStatus: boolean;
};

export type Notification = {
    term: string;
    sectionCode: AASection['sectionCode'];
    notificationStatus: NotificationStatus;
};

export interface NotificationStore {
    initialized: boolean;
    notifications: Record<string, Notification>;
    setNotifications: (sectionCode: AASection['sectionCode'], term: string, status: keyof NotificationStatus) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => {
    return {
        initialized: false,
        notifications: {},
        setNotifications: (sectionCode, term, status) => {
            const key = sectionCode + ' ' + term;

            set((state) => {
                const notifications = state.notifications ?? {};
                const notification = notifications[key] ?? {
                    term,
                    sectionCode,
                    notificationStatus: {
                        openStatus: false,
                        waitlistStatus: false,
                        fullStatus: false,
                        restrictionStatus: false,
                    },
                };
                notification.notificationStatus[status] = !notification.notificationStatus[status];

                return {
                    notifications: {
                        ...notifications,
                        [key]: notification,
                    },
                };
            });
        },
    };
});

Notifications.getNotifications()
    .then((res) => {
        useNotificationStore.setState({ notifications: res, initialized: true });
    })
    .catch((e) => console.error(e));

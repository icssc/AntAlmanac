import { debounce } from '@mui/material';
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
    getNotification: (sectionCode: AASection['sectionCode'], term: string) => Notification | undefined;
    setNotifications: (sectionCode: AASection['sectionCode'], term: string, status: keyof NotificationStatus) => void;
}

const pendingUpdates: Record<string, Notification> = {};

const debouncedSetNotifications = debounce(async () => {
    try {
        const updates = Object.values(pendingUpdates);
        Object.keys(pendingUpdates).forEach((key) => delete pendingUpdates[key]);

        if (updates.length > 0) {
            await Notifications.setNotifications(updates);
        }
    } catch (error) {
        console.error(error);
    }
}, 500);

export const useNotificationStore = create<NotificationStore>((set, get) => {
    return {
        initialized: false,
        notifications: {},
        getNotification: (sectionCode, term) => {
            const key = sectionCode + ' ' + term;
            return get().notifications[key];
        },
        setNotifications: async (sectionCode, term, status) => {
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

                const updatedNotifications = {
                    ...notifications,
                    [key]: notification,
                };

                pendingUpdates[key] = notification;
                debouncedSetNotifications();

                return {
                    notifications: updatedNotifications,
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

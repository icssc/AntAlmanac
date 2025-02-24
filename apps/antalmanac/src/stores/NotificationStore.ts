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
    notifications: Partial<Record<string, Notification>>;
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

export const useNotificationStore = create<NotificationStore>((set) => {
    return {
        initialized: false,
        notifications: {},

        setNotifications: async (sectionCode, term, status) => {
            const key = sectionCode + ' ' + term;

            set((state) => {
                const notifications = state.notifications;
                const existingNotification = notifications[key];

                const newNotification = existingNotification
                    ? {
                          ...existingNotification,
                          notificationStatus: {
                              ...existingNotification.notificationStatus,
                              [status]: !existingNotification.notificationStatus[status],
                          },
                      }
                    : {
                          term,
                          sectionCode,
                          notificationStatus: {
                              openStatus: false,
                              waitlistStatus: false,
                              fullStatus: false,
                              restrictionStatus: false,
                              [status]: true, // Toggle the given (now-initialized) status to true
                          },
                      };

                const updatedNotifications = {
                    ...notifications,
                    [key]: newNotification,
                };

                pendingUpdates[key] = newNotification;
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

import { AASection } from '@packages/antalmanac-types';
import { create } from 'zustand';

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
    notifications: Record<string, Notification> | undefined;
    initializeNotifications: (notifications: Record<string, Notification>) => void;
    setNotifications: (sectionCode: AASection['sectionCode'], term: string, status: keyof NotificationStatus) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => {
    return {
        notifications: undefined,
        initializeNotifications: (initialNotifications) => {
            set(() => ({
                notifications: initialNotifications,
            }));
        },
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

import { AASection } from '@packages/antalmanac-types';
import { create } from 'zustand';

export type NotificationStatus = {
    openStatus: boolean;
    waitlistStatus: boolean;
    fullStatus: boolean;
    restrictionStatus: boolean;
};

export interface NotificationStore {
    notifications: Record<string, NotificationStatus> | undefined;
    initializeNotifications: (notifications: Record<string, NotificationStatus>) => void;
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
            const key = sectionCode + term;

            set((state) => {
                const notificationStatus = state.notifications ?? {};
                const currentStatus = notificationStatus[key] ?? {
                    openStatus: false,
                    waitlistStatus: false,
                    fullStatus: false,
                    restrictionStatus: false,
                };

                const updatedStatus = {
                    ...currentStatus,
                    [status]: !currentStatus[status],
                };

                return {
                    notifications: {
                        ...notificationStatus,
                        [key]: updatedStatus,
                    },
                };
            });
        },
    };
});

import { debounce } from '@mui/material';
import { AASection, Course, CourseInfo } from '@packages/antalmanac-types';
import { create } from 'zustand';

import { Notifications } from '$lib/notifications';
import { WebSOC } from '$lib/websoc';
import { useSessionStore } from '$stores/SessionStore';

export type NotificationStatus = {
    openStatus: boolean;
    waitlistStatus: boolean;
    fullStatus: boolean;
    restrictionStatus: boolean;
};

export type Notification = {
    term: string;
    sectionCode: AASection['sectionCode'];
    units: number;
    sectionNum: string;
    courseTitle: Course['title'];
    sectionType: AASection['sectionType'];
    notificationStatus: NotificationStatus;
    lastUpdated: string;
    lastCodes: string;
};

interface RawNotification {
    year: string;
    quarter: string;
    sectionCode: number;
}

export interface NotificationStore {
    initialized: boolean;
    notifications: Partial<Record<string, Notification>>;
    setNotifications: (
        notification: Omit<Notification, 'notificationStatus'> & { status: keyof NotificationStatus }
    ) => void;
    deleteNotification: (notificationKey: string) => void;
    loadNotifications: () => Promise<void>;
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
        setNotifications: async ({
            courseTitle,
            sectionCode,
            units,
            sectionNum,
            term,
            sectionType,
            status,
            lastUpdated,
            lastCodes,
        }) => {
            const key = sectionCode + ' ' + term;

            set((state) => {
                const notifications = state.notifications;
                const existingNotification = notifications[key];
                const previousLastUpdated = existingNotification?.lastUpdated ?? null;

                const previousLastCodes = existingNotification?.lastCodes ?? null;

                const newNotification = existingNotification
                    ? {
                          ...existingNotification,
                          notificationStatus: {
                              ...existingNotification.notificationStatus,
                              [status]: !existingNotification.notificationStatus[status],
                          },
                          lastUpdated,
                          lastCodes,
                      }
                    : {
                          term,
                          sectionCode,
                          courseTitle,
                          sectionType,
                          units,
                          sectionNum,
                          notificationStatus: {
                              openStatus: false,
                              waitlistStatus: false,
                              fullStatus: false,
                              restrictionStatus: false,
                              [status]: true, // Toggle the given (now-initialized) status to true
                          },
                          lastUpdated,
                          lastCodes,
                      };

                const updatedNotifications = {
                    ...notifications,
                    [key]: newNotification,
                };
                if (
                    previousLastUpdated !== newNotification.lastUpdated ||
                    previousLastCodes !== newNotification.lastCodes
                ) {
                    Notifications.updateNotifications(newNotification);
                }

                pendingUpdates[key] = newNotification;

                debouncedSetNotifications();
                return {
                    notifications: updatedNotifications,
                };
            });
        },
        deleteNotification: (notificationKey) => {
            set((state) => {
                const updatedNotifications = { ...state.notifications };
                const notificationToDelete = updatedNotifications[notificationKey];

                delete updatedNotifications[notificationKey];

                if (notificationToDelete) {
                    Notifications.deleteNotification(notificationToDelete);
                }

                return {
                    notifications: updatedNotifications,
                };
            });
        },
        loadNotifications: async () => {
            const { isGoogleUser } = useSessionStore.getState();
            if (!isGoogleUser) {
                set({ notifications: {}, initialized: true });
                return;
            }

            try {
                const existingNotifications = await Notifications.getNotifications();
                const courseDict: { [key: string]: Set<string> } = {};

                for (const notification of existingNotifications) {
                    const { year, quarter, sectionCode } = notification;
                    const term = year + ' ' + quarter;

                    if (term in courseDict) {
                        courseDict[term].add(sectionCode.toString());
                    } else {
                        courseDict[term] = new Set([sectionCode.toString()]);
                    }
                }

                const courseInfoDict = new Map<string, { [sectionCode: string]: CourseInfo }>();
                const websocRequests = Object.entries(courseDict).map(async ([term, courseSet]) => {
                    const sectionCodes = Array.from(courseSet).join(',');
                    const courseInfo = await WebSOC.getCourseInfo({ term, sectionCodes });
                    courseInfoDict.set(term, courseInfo);
                });

                await Promise.all(websocRequests);

                const notifications: Partial<Record<string, Notification>> = {};

                for (const [term, courseInfo] of courseInfoDict.entries()) {
                    for (const sectionCode in courseInfo) {
                        const course = courseInfo[sectionCode];
                        const key = sectionCode + ' ' + term;

                        const existingNotification = existingNotifications.find(
                            (notification: RawNotification) =>
                                notification.sectionCode.toString() === sectionCode &&
                                notification.year === term.split(' ')[0] &&
                                notification.quarter === term.split(' ')[1]
                        );

                        if (existingNotification) {
                            notifications[key] = {
                                term,
                                sectionCode,
                                courseTitle: course.courseDetails.courseTitle,
                                sectionType: course.section.sectionType,
                                units: Number(course.section.units),
                                sectionNum: course.section.sectionNum,
                                notificationStatus: {
                                    openStatus: existingNotification.openStatus ?? false,
                                    waitlistStatus: existingNotification.waitlistStatus ?? false,
                                    fullStatus: existingNotification.fullStatus ?? false,
                                    restrictionStatus: existingNotification.restrictionStatus ?? false,
                                },
                                lastUpdated: existingNotification.lastUpdated ?? course.section.status,
                                lastCodes: existingNotification.lastCodes ?? course.section.restrictions,
                            };
                        }
                    }
                }

                set({ notifications, initialized: true });
            } catch (error) {
                console.error('Failed to load notifications:', error);
                set({ initialized: true });
            }
        },
    };
});

// Initial load of notifications
useNotificationStore.getState().loadNotifications();

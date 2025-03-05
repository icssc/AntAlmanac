import { debounce } from '@mui/material';
import { AASection, Course, CourseInfo } from '@packages/antalmanac-types';
import { create } from 'zustand';

import { Notifications } from '$lib/notifications';
import { WebSOC } from '$lib/websoc';

export type NotificationStatus = {
    openStatus: boolean;
    waitlistStatus: boolean;
    fullStatus: boolean;
    restrictionStatus: boolean;
};

export type Notification = {
    term: string;
    sectionCode: AASection['sectionCode'];
    courseTitle: Course['title'];
    sectionType: AASection['sectionType'];
    notificationStatus: NotificationStatus;
    lastUpdated: string;
    lastCodes: string;
};

export interface NotificationStore {
    initialized: boolean;
    notifications: Partial<Record<string, Notification>>;
    setNotifications: (
        notification: Omit<Notification, 'notificationStatus'> & { status: keyof NotificationStatus }
    ) => void;
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
        setNotifications: async ({ courseTitle, sectionCode, term, sectionType, status, lastUpdated, lastCodes }) => {
            const key = sectionCode + ' ' + term;

            set((state) => {
                const notifications = state.notifications;
                const existingNotification = notifications[key];
                if (lastUpdated === 'Waitl') {
                    lastUpdated = 'WAITLISTED';
                }
                let previousLastUpdated = existingNotification?.lastUpdated ?? null;
                if (previousLastUpdated === 'Waitl') {
                    previousLastUpdated = 'WAITLISTED';
                }
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
    };
});

Notifications.getNotifications()
    .then(async (existingNotifications) => {
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

        return Promise.all(websocRequests).then(() => ({ existingNotifications, courseInfoDict }));
    })
    .then(({ existingNotifications, courseInfoDict }) => {
        const notifications: Partial<Record<string, Notification>> = {};

        for (const [term, courseInfo] of courseInfoDict.entries()) {
            for (const sectionCode in courseInfo) {
                const course = courseInfo[sectionCode];
                const key = sectionCode + ' ' + term;

                const existingNotification = existingNotifications.find(
                    (notification) =>
                        notification.sectionCode === parseInt(sectionCode) &&
                        notification.year === term.split(' ')[0] &&
                        notification.quarter === term.split(' ')[1]
                );

                notifications[key] = {
                    term,
                    sectionCode,
                    courseTitle: course.courseDetails.courseTitle,
                    sectionType: course.section.sectionType,
                    notificationStatus: {
                        openStatus: existingNotification?.openStatus ?? false,
                        waitlistStatus: existingNotification?.waitlistStatus ?? false,
                        fullStatus: existingNotification?.fullStatus ?? false,
                        restrictionStatus: existingNotification?.restrictionStatus ?? false,
                    },
                    lastUpdated: existingNotification.lastUpdated ?? course.section.status,
                    lastCodes: existingNotification.lastCodes ?? course.section.restrictions,
                };
            }
        }
        useNotificationStore.setState({ notifications, initialized: true });
    })
    .catch((e) => console.error(e));

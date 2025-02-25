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
        setNotifications: async ({ courseTitle, sectionCode, term, sectionType, status }) => {
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
                          courseTitle,
                          sectionType,
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
    .then(async (res) => {
        const courseDict: { [key: string]: Set<string> } = {};

        for (const notification of res) {
            const { year, quarter, sectionCode } = notification;
            const term = year + ' ' + quarter;

            if (term in courseDict) {
                courseDict[term].add(sectionCode);
            } else {
                courseDict[term] = new Set([sectionCode]);
            }
        }

        const courseInfoDict = new Map<string, { [sectionCode: string]: CourseInfo }>();
        const websocRequests = Object.entries(courseDict).map(async ([term, courseSet]) => {
            const sectionCodes = Array.from(courseSet).join(',');
            const courseInfo = await WebSOC.getCourseInfo({ term, sectionCodes });
            courseInfoDict.set(term, courseInfo);
        });

        return Promise.all(websocRequests).then(() => courseInfoDict);
    })
    .then((res) => {
        const notifications: Partial<Record<string, Notification>> = {};

        for (const [term, courseInfo] of res.entries()) {
            for (const sectionCode in courseInfo) {
                const course = courseInfo[sectionCode];
                const key = sectionCode + ' ' + term;

                notifications[key] = {
                    term,
                    sectionCode,
                    courseTitle: course.courseDetails.courseTitle,
                    sectionType: course.section.sectionType,
                    notificationStatus: {
                        openStatus: false,
                        waitlistStatus: false,
                        fullStatus: false,
                        restrictionStatus: false,
                    },
                };
            }
        }

        useNotificationStore.setState({ notifications, initialized: true });
    })
    .catch((e) => console.error(e));

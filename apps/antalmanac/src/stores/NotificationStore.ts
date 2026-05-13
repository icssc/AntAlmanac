import trpc from '$lib/api/trpc';
import { Notifications } from '$lib/notifications';
import { buildTermShortName, parseTermShortName, type Quarter } from '$lib/term-constants';
import { useSessionStore } from '$stores/SessionStore';
import { debounce } from '@mui/material';
import { type AASection, type CourseInfo, WebsocSectionStatusSchema } from '@packages/antalmanac-types';
import type { Course } from '@packages/anteater-api/types';
import { create } from 'zustand';

export type NotifyOn = {
    notifyOnOpen: boolean;
    notifyOnWaitlist: boolean;
    notifyOnFull: boolean;
    notifyOnRestriction: boolean;
};

export type Notification = {
    term: string;
    sectionCode: AASection['sectionCode'];
    units: number;
    sectionNum: string;
    courseTitle: Course['title'];
    sectionType: AASection['sectionType'];
    notifyOn: NotifyOn;
    lastUpdatedStatus: AASection['status'] | null;
    lastCodes: string;
    deptCode?: string;
    courseNumber?: string;
    instructors?: string[];
};

interface RawNotification {
    year: string;
    quarter: string;
    sectionCode: string;
}

interface NotificationStore {
    initialized: boolean;
    notifications: Partial<Record<string, Notification>>;
    setNotifications: (notification: Omit<Notification, 'notifyOn'> & { status: keyof NotifyOn }) => void;
    deleteNotification: (notificationKey: string) => void;
    loadNotifications: () => Promise<void>;
}

const pendingUpdates: Record<string, Notification> = {};

const debouncedSetNotifications = debounce(async () => {
    try {
        const updates = Object.values(pendingUpdates);
        Object.keys(pendingUpdates).forEach((key) => {
            delete pendingUpdates[key];
        });

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
            lastUpdatedStatus,
            lastCodes,
            deptCode,
            courseNumber,
            instructors,
        }) => {
            const key = sectionCode + ' ' + term;

            set((state) => {
                const notifications = state.notifications;
                const existingNotification = notifications[key];
                const previousLastUpdated = existingNotification?.lastUpdatedStatus ?? null;

                const previousLastCodes = existingNotification?.lastCodes ?? null;

                const newNotification = existingNotification
                    ? {
                          ...existingNotification,
                          notifyOn: {
                              ...existingNotification.notifyOn,
                              [status]: !existingNotification.notifyOn[status],
                          },
                          lastUpdatedStatus,
                          lastCodes,
                      }
                    : {
                          term,
                          sectionCode,
                          courseTitle,
                          sectionType,
                          units,
                          sectionNum,
                          notifyOn: {
                              notifyOnOpen: false,
                              notifyOnWaitlist: false,
                              notifyOnFull: false,
                              notifyOnRestriction: false,
                              [status]: true, // Toggle the given (now-initialized) status to true
                          },
                          lastUpdatedStatus,
                          lastCodes,
                          deptCode,
                          courseNumber,
                          instructors,
                      };

                const updatedNotifications = {
                    ...notifications,
                    [key]: newNotification,
                };
                if (
                    previousLastUpdated !== newNotification.lastUpdatedStatus ||
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
                if (!existingNotifications) {
                    set({ notifications: {}, initialized: true });
                    return;
                }

                const courseDict: { [key: string]: Set<string> } = {};

                for (const notification of existingNotifications) {
                    const { year, quarter, sectionCode } = notification;
                    const term = buildTermShortName(year, quarter as Quarter);

                    if (term in courseDict) {
                        courseDict[term].add(sectionCode.toString());
                    } else {
                        courseDict[term] = new Set([sectionCode.toString()]);
                    }
                }

                const courseInfoDict = new Map<string, { [sectionCode: string]: CourseInfo }>();
                const websocRequests = Object.entries(courseDict).map(async ([term, courseSet]) => {
                    const sectionCodes = Array.from(courseSet).join(',');
                    const courseInfo = await trpc.websoc.getCourseInfo.query({
                        term,
                        sectionCodes,
                    });
                    courseInfoDict.set(term, courseInfo);
                });

                await Promise.all(websocRequests);

                const notifications: Partial<Record<string, Notification>> = {};

                for (const [term, courseInfo] of courseInfoDict.entries()) {
                    for (const sectionCode in courseInfo) {
                        const course = courseInfo[sectionCode];
                        const key = sectionCode + ' ' + term;

                        const termParts = parseTermShortName(term);
                        const existingNotification = existingNotifications.find(
                            (notification: RawNotification) =>
                                notification.sectionCode === sectionCode &&
                                termParts !== null &&
                                notification.year === termParts.year &&
                                notification.quarter === termParts.quarter
                        );

                        if (existingNotification) {
                            const storedStatus = existingNotification.lastUpdatedStatus;
                            const parsedStatus =
                                storedStatus !== null ? WebsocSectionStatusSchema.safeParse(storedStatus) : null;
                            const lastUpdatedStatus =
                                parsedStatus === null
                                    ? null
                                    : parsedStatus.success
                                      ? parsedStatus.data
                                      : course.section.status;

                            notifications[key] = {
                                term,
                                sectionCode,
                                courseTitle: course.courseDetails.courseTitle,
                                sectionType: course.section.sectionType,
                                units: Number(course.section.units),
                                sectionNum: course.section.sectionNum,
                                notifyOn: {
                                    notifyOnOpen: existingNotification.notifyOnOpen ?? false,
                                    notifyOnWaitlist: existingNotification.notifyOnWaitlist ?? false,
                                    notifyOnFull: existingNotification.notifyOnFull ?? false,
                                    notifyOnRestriction: existingNotification.notifyOnRestriction ?? false,
                                },
                                lastUpdatedStatus: lastUpdatedStatus,
                                lastCodes: existingNotification.lastCodes ?? course.section.restrictions,
                                deptCode: course.courseDetails.deptCode,
                                courseNumber: course.courseDetails.courseNumber,
                                instructors: course.section.instructors,
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

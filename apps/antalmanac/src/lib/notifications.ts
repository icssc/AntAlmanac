import trpc from "$lib/api/trpc";
import { getLocalStorageSessionId } from "$lib/localStorage";
import { Notification } from "$stores/NotificationStore";

function _transformNotificationToApiFormat(notification: Notification) {
    return {
        term: notification.term,
        sectionCode: notification.sectionCode.toString(),
        courseTitle: notification.courseTitle,
        sectionType: notification.sectionType,
        lastUpdatedStatus: notification.lastUpdated,
        lastCodes: notification.lastCodes,
        notifyOn: notification.notifyOn,
    };
}

class NotificationsClient {
    async getNotifications() {
        const currentSession = getLocalStorageSessionId();
        if (currentSession) {
            const userId = await trpc.auth.getSessionUserId.query({ token: currentSession ?? "" });
            if (userId) {
                return await trpc.notifications.get.query({ userId });
            }
        } else {
            return [];
        }
    }

    async setNotifications(notifications: Notification[]) {
        const currentSession = getLocalStorageSessionId();
        if (currentSession) {
            const userId = await trpc.auth.getSessionUserId.query({ token: currentSession ?? "" });
            if (userId) {
                const transformedNotifications = notifications.map(
                    _transformNotificationToApiFormat,
                );
                return await trpc.notifications.set.mutate({
                    userId,
                    notifications: transformedNotifications,
                });
            }
        } else {
            console.error("No session found to set notifications successfully.");
            return;
        }
    }

    async updateNotifications(notification: Notification) {
        const transformedNotification = _transformNotificationToApiFormat(notification);
        return await trpc.notifications.updateNotifications.mutate({
            notification: transformedNotification,
        });
    }

    async deleteNotification(notification: Notification) {
        const currentSession = getLocalStorageSessionId();
        if (currentSession) {
            const userId = await trpc.auth.getSessionUserId.query({ token: currentSession ?? "" });
            if (userId) {
                const transformedNotification = _transformNotificationToApiFormat(notification);
                return await trpc.notifications.deleteNotification.mutate({
                    userId,
                    notification: transformedNotification,
                });
            }
        } else {
            console.error("No session found to delete notification successfully.");
            return;
        }
    }
}

export const Notifications = new NotificationsClient();

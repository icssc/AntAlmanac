import trpc from '$lib/api/trpc';
import type { Notification } from '$stores/NotificationStore';
import { useSessionStore } from '$stores/SessionStore';

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

function getUserId(): string | null {
    return useSessionStore.getState().userId;
}

class NotificationsClient {
    async getNotifications() {
        const userId = getUserId();
        if (userId) {
            return await trpc.notifications.get.query({ userId });
        }
        return [];
    }

    async setNotifications(notifications: Notification[]) {
        const userId = getUserId();
        if (userId) {
            const transformedNotifications = notifications.map(_transformNotificationToApiFormat);
            return await trpc.notifications.set.mutate({ userId, notifications: transformedNotifications });
        }
        console.error('No session found to set notifications successfully.');
    }

    async updateNotifications(notification: Notification) {
        const transformedNotification = _transformNotificationToApiFormat(notification);
        return await trpc.notifications.updateNotifications.mutate({ notification: transformedNotification });
    }

    async deleteNotification(notification: Notification) {
        const userId = getUserId();
        if (userId) {
            const transformedNotification = _transformNotificationToApiFormat(notification);
            return await trpc.notifications.deleteNotification.mutate({
                userId,
                notification: transformedNotification,
            });
        }
        console.error('No session found to delete notification successfully.');
    }
}

export const Notifications = new NotificationsClient();

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

class NotificationsClient {
    async getNotifications() {
        if (useSessionStore.getState().sessionIsValid) {
            return await trpc.notifications.get.query();
        }
        return [];
    }

    async setNotifications(notifications: Notification[]) {
        if (useSessionStore.getState().sessionIsValid) {
            const transformedNotifications = notifications.map(_transformNotificationToApiFormat);
            return await trpc.notifications.set.mutate({ notifications: transformedNotifications });
        }
        console.error('No session found to set notifications successfully.');
    }

    async deleteNotification(notification: Notification) {
        const userId = useSessionStore.getState().userId;
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

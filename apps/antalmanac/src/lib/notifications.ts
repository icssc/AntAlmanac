import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId } from '$lib/localStorage';
import { Notification } from '$stores/NotificationStore';

class NotificationsClient {
    async getNotifications() {
        const currentSession = getLocalStorageSessionId();
        if (currentSession) {
            const userId = await trpc.auth.getSessionUserId.query({ token: currentSession ?? '' });
            if (userId) {
                return await trpc.notifications.get.query({ id: userId });
            }
        } else {
            return [];
        }
    }

    async setNotifications(notifications: Notification[]) {
        const currentSession = getLocalStorageSessionId();
        if (currentSession) {
            const userId = await trpc.auth.getSessionUserId.query({ token: currentSession ?? '' });
            if (userId) {
                return await trpc.notifications.set.mutate({ id: userId, notifications });
            }
        } else {
            console.error('No session found to set notifications successfully.');
            return;
        }
    }

    async updateNotifications(notification: Notification) {
        return await trpc.notifications.updateNotifications.mutate({ notification: notification });
    }

    async deleteNotification(notification: Notification) {
        const currentSession = getLocalStorageSessionId();
        if (currentSession) {
            const userId = await trpc.auth.getSessionUserId.query({ token: currentSession ?? '' });
            if (userId) {
                return await trpc.notifications.deleteNotification.mutate({ id: userId, notification });
            }
        } else {
            console.error('No session found to delete notification successfully.');
            return;
        }
    }
}

export const Notifications = new NotificationsClient();

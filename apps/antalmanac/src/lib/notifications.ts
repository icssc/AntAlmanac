import trpc from '$lib/api/trpc';
import type { Notification } from '$stores/NotificationStore';
import { useSessionStore } from '$stores/SessionStore';

class NotificationsClient {
    async getNotifications() {
        if (useSessionStore.getState().sessionIsValid) {
            return await trpc.notifications.get.query();
        }
        return [];
    }

    async setNotifications(notifications: Notification[]) {
        if (useSessionStore.getState().sessionIsValid) {
            return await trpc.notifications.set.mutate({ notifications });
        }
        console.error('No session found to set notifications successfully.');
    }

    async updateNotifications(notification: Notification) {
        return await trpc.notifications.updateNotifications.mutate({ notification });
    }

    async deleteNotification(notification: Notification) {
        const userId = useSessionStore.getState().userId;
        if (userId) {
            return await trpc.notifications.deleteNotification.mutate({
                userId,
                sectionCode: notification.sectionCode,
                term: notification.term,
            });
        }
        console.error('No session found to delete notification successfully.');
    }
}

export const Notifications = new NotificationsClient();

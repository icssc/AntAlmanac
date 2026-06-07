import { trpc } from '$lib/api/trpc';
import { authClient } from '$lib/auth/authClient';
import type { Notification } from '$stores/NotificationStore';

function serializeNotification(notification: Notification) {
    const { term, ...rest } = notification;

    return {
        ...rest,
        year: term.year,
        quarter: term.quarter,
    };
}

class NotificationsClient {
    async getNotifications() {
        return await trpc.notifications.get.query();
    }

    async setNotifications(notifications: Notification[]) {
        return await trpc.notifications.set.mutate({ notifications: notifications.map(serializeNotification) });
    }

    async updateNotifications(notification: Notification) {
        return await trpc.notifications.updateNotifications.mutate({
            notification: serializeNotification(notification),
        });
    }

    async deleteNotification(notification: Notification) {
        const { data: session } = await authClient.getSession();
        const userId = session?.user.id;
        if (userId) {
            return await trpc.notifications.deleteNotification.mutate({
                userId,
                sectionCode: notification.sectionCode,
                year: notification.term.year,
                quarter: notification.term.quarter,
            });
        }
        console.error('No session found to delete notification successfully.');
    }
}

export const Notifications = new NotificationsClient();

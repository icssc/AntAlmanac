import trpc from '$lib/api/trpc';
import { Notification } from '$stores/NotificationStore';

class _Notifications {
    async getNotifications() {
        return await trpc.notifications.get.query({ id: '123' });
    }

    async setNotifications(notifications: Notification[]) {
        return await trpc.notifications.set.mutate({ notifications });
    }
}

export const Notifications = new _Notifications();

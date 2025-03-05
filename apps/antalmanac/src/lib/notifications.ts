import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId } from '$lib/localStorage';
import { Notification } from '$stores/NotificationStore';

class _Notifications {
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
            return;
        }
    }
}

export const Notifications = new _Notifications();

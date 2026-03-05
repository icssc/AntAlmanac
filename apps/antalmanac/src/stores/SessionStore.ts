import { create } from 'zustand';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';
import { useNotificationStore } from '$stores/NotificationStore';

interface SessionState {
    session: string | null;
    userId: string | null;
    isGoogleUser: boolean;
    email: string | null;
    sessionIsValid: boolean;
    updateSession: (session: string | null) => Promise<boolean>;
    clearSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => {
    const localSessionId = getLocalStorageSessionId();
    return {
        session: localSessionId,
        userId: null,
        isGoogleUser: false,
        email: null,
        sessionIsValid: false,
        updateSession: async (session) => {
            if (session) {
                const sessionIsValid: boolean = await trpc.auth.validateSession.query({
                    token: session,
                });
                if (sessionIsValid) {
                    setLocalStorageSessionId(session);
                    set({ session: session, sessionIsValid: true });

                    try {
                        const { users } = await trpc.userData.getUserAndAccountBySessionToken.query({
                            token: session,
                        });
                        const isGoogleUser = Boolean(users.email);
                        set({
                            userId: users.id,
                            isGoogleUser,
                            email: users.email ?? null,
                        });
                    } catch (error) {
                        console.error('Failed to fetch user data:', error);
                        set({ isGoogleUser: false, email: null });
                    }
                }
                useNotificationStore.getState().loadNotifications();
                return sessionIsValid;
            } else {
                set({ session: null, sessionIsValid: false });
                useNotificationStore.getState().loadNotifications();
                return false;
            }
        },
        clearSession: async () => {
            const currentSession = getLocalStorageSessionId();
            if (currentSession) {
                await trpc.auth.invalidateSession.mutate({ token: currentSession });
                removeLocalStorageSessionId();
                set({
                    session: null,
                    userId: null,
                    sessionIsValid: false,
                    isGoogleUser: false,
                    email: null,
                });
                window.location.reload();
            }
        },
    };
});

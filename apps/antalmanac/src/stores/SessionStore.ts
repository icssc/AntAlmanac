import { create } from 'zustand';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';

interface SessionState {
    session: string | null;
    isGoogleUser: boolean;
    fetchUserData: (session: string | null) => Promise<void>;
    sessionIsValid: boolean;
    updateSession: (session: string | null) => Promise<void>;
    clearSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => {
    const localSessionId = getLocalStorageSessionId();
    return {
        session: localSessionId,
        isGoogleUser: false,
        fetchUserData: async (session) => {
            if (!session) {
                return;
            }

            try {
                const { users } = await trpc.userData.getUserAndAccountBySessionToken.query({
                    token: session,
                });

                const isGoogleUser = Boolean(users.email);

                set({
                    isGoogleUser,
                });
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                set({ isGoogleUser: false });
            }
        },
        sessionIsValid: false,
        updateSession: async (session) => {
            if (session) {
                const sessionIsValid: boolean = await trpc.auth.validateSession.query({ token: session });
                if (sessionIsValid) {
                    setLocalStorageSessionId(session);
                    set({ session: session, sessionIsValid: true });
                }
            } else {
                set({ session: null, sessionIsValid: false });
            }
        },
        clearSession: async () => {
            const currentSession = getLocalStorageSessionId();
            if (currentSession) {
                await trpc.auth.invalidateSession.mutate({ token: currentSession });
                removeLocalStorageSessionId();
                set({ session: null, sessionIsValid: false });
                window.location.reload();
            }
        },
    };
});

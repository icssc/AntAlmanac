import { create } from 'zustand';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';

interface SessionState {
    session: string | null;
    validSession: boolean;
    isGoogleUser: boolean;
    fetchUserData: (session: string | null) => Promise<void>;
    setSession: (session: string | null) => Promise<void>;
    clearSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => {
    const localSessionId = getLocalStorageSessionId();
    return {
        session: localSessionId,
        validSession: false,
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
        setSession: async (session) => {
            if (session) {
                const validSession: boolean = await trpc.auth.validateSession.query({ token: session });
                if (validSession) {
                    setLocalStorageSessionId(session);
                    set({ session: session, validSession: true });
                }
            } else {
                set({ session: null, validSession: false });
            }
        },
        clearSession: async () => {
            const currentSession = getLocalStorageSessionId();
            if (currentSession) {
                await trpc.auth.removeSession.mutate({ token: currentSession });
                removeLocalStorageSessionId();
                set({ session: null, validSession: false });
                window.location.reload();
            }
        },
    };
});

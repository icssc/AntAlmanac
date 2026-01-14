import { create } from 'zustand';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';

interface SessionState {
    session: string | null;
    sessionIsValid: boolean;
    updateSession: (session: string | null) => Promise<void>;
    clearSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => {
    const localSessionId = getLocalStorageSessionId();
    return {
        session: localSessionId,
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
                window.localStorage.removeItem('sessionId');
            }
        },
    };
});

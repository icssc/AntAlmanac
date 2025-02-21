import { create } from 'zustand';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';

interface SessionState {
    session: string | null;
    validSession: boolean;
    updateSession: (session: string | null) => Promise<void>;
    clearSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => {
    const localSessionId = getLocalStorageSessionId();
    return {
        session: localSessionId,
        validSession: false,
        updateSession: async (session) => {
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

import { create } from 'zustand';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';
import { OIDC_ISSUER_URL } from '$src/globals';

interface SessionState {
    session: string | null;
    sessionIsValid: boolean;
    updateSession: (session: string | null) => Promise<void>;
    clearSession: () => Promise<void>;
    validateIdpSession: () => Promise<boolean>;
}

export const useSessionStore = create<SessionState>((set, get) => {
    const localSessionId = getLocalStorageSessionId();
    return {
        session: localSessionId,
        sessionIsValid: false,

        validateIdpSession: async () => {
            try {
                const response = await fetch(`${OIDC_ISSUER_URL}/session`, {
                    credentials: 'include', // Sends cookies
                });

                if (!response.ok) {
                    removeLocalStorageSessionId();
                    set({ session: null, sessionIsValid: false });
                    return false;
                }

                return true;
            } catch (error) {
                console.error('Failed to validate IdP session:', error);
                return true;
            }
        },

        updateSession: async (session) => {
            if (session) {
                const idpValid = await get().validateIdpSession();
                const sessionIsValid: boolean = await trpc.auth.validateSession.query({ token: session });

                if (sessionIsValid && idpValid) {
                    setLocalStorageSessionId(session);
                    set({ session: session, sessionIsValid: true });
                } else {
                    removeLocalStorageSessionId();
                    set({ session: null, sessionIsValid: false });
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

                try {
                    await fetch(`${OIDC_ISSUER_URL}/logout`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                } catch (error) {
                    console.error('Failed to invalidate IdP session:', error);
                }

                set({ session: null, sessionIsValid: false });
                window.location.reload();
            }
        },
    };
});

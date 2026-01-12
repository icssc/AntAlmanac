import { create } from 'zustand';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';

interface SessionState {
    session: string | null;
    sessionIsValid: boolean;
    updateSession: (session: string | null) => Promise<void>;
    clearSession: () => Promise<void>;

    googleId: string | null;
    filterTakenCourses: boolean;
    userTakenCourses: Set<string>;

    setGoogleId: (id: string) => void;
    setFilterTakenCourses: (value: boolean) => void;
    setUserTakenCourses: (courses: Set<string>) => void;
}

export const useSessionStore = create<SessionState>((set) => {
    const localSessionId = getLocalStorageSessionId();
    return {
        session: localSessionId,
        sessionIsValid: false,
        googleId: null,
        filterTakenCourses: false,
        userTakenCourses: new Set(),
        updateSession: async (session) => {
            if (session) {
                const sessionIsValid: boolean = await trpc.auth.validateSession.query({ token: session });
                if (sessionIsValid) {
                    setLocalStorageSessionId(session);
                    set({ session: session, sessionIsValid: true });

                    try {
                        const { users } = await trpc.userData.getUserAndAccountBySessionToken
                            .query({ token: session });
                        let googleId = await trpc.userData.getGoogleIdByUserId.query({
                            userId: users.id,
                        });
                        if (googleId?.startsWith("google_")) {
                            googleId = googleId.slice("google_".length);
                        }
                        set({ googleId });
                    } catch (e) {
                        console.error("❌ Failed to load googleId:", e);
                        set({ googleId: null })
                    }
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
                set({
                    session: null,
                    sessionIsValid: false,
                    googleId: null,
                    filterTakenCourses: false,
                    userTakenCourses: new Set(),
                });
                window.location.reload();
            }
        },
        setGoogleId: (id) => set({ googleId: id }),
        setFilterTakenCourses: (value) => set({ filterTakenCourses: value }),
        setUserTakenCourses: (courses) => set({ userTakenCourses: courses }),
    };
});

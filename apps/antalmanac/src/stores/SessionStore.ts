import { create } from 'zustand';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';

interface SessionState {
    session: string | null;
    sessionIsValid: boolean;
    googleId: string | null;
    filterTakenCourses: boolean;
    userTakenCourses: Set<string>;
    updateSession: (session: string | null) => Promise<void>;
    clearSession: () => Promise<void>;
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
        setGoogleId: (id: string) => set({ googleId: id }),
        setFilterTakenCourses: (value: boolean) => set({ filterTakenCourses: value }),
        setUserTakenCourses: (courses: Set<string>) => set({ userTakenCourses: courses }),
    };
});

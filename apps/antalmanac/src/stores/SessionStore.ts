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
        userId: null,
        isGoogleUser: false,
        email: null,
        sessionIsValid: false,
        googleId: null,
        filterTakenCourses: false,
        userTakenCourses: new Set(),
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

                        let googleId = await trpc.userData.getGoogleIdByUserId.query({
                            userId: users.id,
                        });
                        if (googleId?.startsWith('google_')) {
                            googleId = googleId.slice('google_'.length);
                        }
                        const isGoogleUser = Boolean(users.email);
                        set({
                            userId: users.id,
                            isGoogleUser,
                            email: users.email ?? null,
                            googleId,
                        });                      
                        if (isGoogleUser) {
                            useNotificationStore.getState().loadNotifications();
                        }
                    } catch (e) {
                        console.error('Failed to fetch user data:', e);
                        set({ isGoogleUser: false, email: null, googleId: null });
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
                    userId: null,
                    sessionIsValid: false,
                    isGoogleUser: false,
                    email: null,
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

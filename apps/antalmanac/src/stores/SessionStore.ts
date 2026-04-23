import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId, setLocalStorageSessionId } from '$lib/localStorage';
import { clearSsoCookie } from '$lib/ssoCookie';
import { useNotificationStore } from '$stores/NotificationStore';
import type { Roadmap } from '@packages/antalmanac-types';
import { create } from 'zustand';

interface SessionState {
    session: string | null;
    userId: string | null;
    isGoogleUser: boolean;
    email: string | null;
    sessionIsValid: boolean;
    updateSession: (session: string | null) => Promise<boolean>;
    clearSession: () => Promise<void>;

    googleId: string | null;
    filterTakenCourses: boolean;
    userTakenCourses: Set<string>;

    plannerRoadmaps: Roadmap[];
    isPlannerLoading: boolean;

    setGoogleId: (id: string) => void;
    setFilterTakenCourses: (value: boolean) => void;
    setUserTakenCourses: (courses: Set<string>) => void;
    setPlannerRoadmaps: (roadmaps: Roadmap[]) => void;
    setIsPlannerLoading: (isPlannerLoading: boolean) => void;
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
        plannerRoadmaps: [],
        isPlannerLoading: false,
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
                    } catch (error) {
                        console.error('Failed to fetch user data:', error);
                        set({ isGoogleUser: false, email: null, googleId: null });
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
                clearSsoCookie();
                set({
                    session: null,
                    userId: null,
                    sessionIsValid: false,
                    isGoogleUser: false,
                    email: null,
                    googleId: null,
                    filterTakenCourses: false,
                    userTakenCourses: new Set(),
                    plannerRoadmaps: [],
                    isPlannerLoading: false,
                });
                window.location.reload();
            }
        },
        setGoogleId: (id) => set({ googleId: id }),
        setFilterTakenCourses: (value) => set({ filterTakenCourses: value }),
        setUserTakenCourses: (courses) => set({ userTakenCourses: courses }),
        setPlannerRoadmaps: (roadmaps) => set({ plannerRoadmaps: roadmaps }),
        setIsPlannerLoading: (isPlannerLoading) => set({ isPlannerLoading }),
    };
});

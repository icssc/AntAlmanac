import trpc from '$lib/api/trpc';
import { clearSsoCookie } from '$lib/ssoCookie';
import { useNotificationStore } from '$stores/NotificationStore';
import type { Roadmap } from '@packages/antalmanac-types';
import { create } from 'zustand';

interface SessionState {
    userId: string | null;
    isGoogleUser: boolean;
    email: string | null;
    sessionIsValid: boolean;
    loadSession: () => Promise<boolean>;
    clearSession: () => Promise<string | null>;

    googleId: string | null;
    filterTakenCourses: boolean;
    userTakenCourses: Set<string>;

    plannerRoadmaps: Roadmap[];

    setGoogleId: (id: string) => void;
    setFilterTakenCourses: (value: boolean) => void;
    setUserTakenCourses: (courses: Set<string>) => void;
    setPlannerRoadmaps: (roadmaps: Roadmap[]) => void;
}

export const useSessionStore = create<SessionState>((set) => {
    // Clean up stale localStorage token from before the cookie migration
    window.localStorage.removeItem('sessionId');

    return {
        userId: null,
        isGoogleUser: false,
        email: null,
        sessionIsValid: false,
        googleId: null,
        filterTakenCourses: false,
        userTakenCourses: new Set(),
        plannerRoadmaps: [],

        loadSession: async () => {
            try {
                const sessionIsValid = await trpc.auth.validateSession.query();
                if (!sessionIsValid) {
                    set({ sessionIsValid: false, userId: null });
                    useNotificationStore.getState().loadNotifications();
                    return false;
                }

                set({ sessionIsValid: true });

                const { users } = await trpc.userData.getUserAndAccountBySessionToken.query();

                let googleId = await trpc.userData.getGoogleIdByUserId.query();
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

                useNotificationStore.getState().loadNotifications();
                return true;
            } catch (error) {
                console.error('Failed to load session:', error);
                set({ sessionIsValid: false, userId: null, isGoogleUser: false, email: null, googleId: null });
                useNotificationStore.getState().loadNotifications();
                return false;
            }
        },

        clearSession: async () => {
            let logoutUrl: string | null = null;
            try {
                const result = await trpc.userData.logout.mutate({
                    redirectUrl: window.location.origin,
                });
                logoutUrl = result.logoutUrl;
            } catch (error) {
                console.error('Error during logout:', error);
            }

            clearSsoCookie();
            set({
                userId: null,
                sessionIsValid: false,
                isGoogleUser: false,
                email: null,
                googleId: null,
                filterTakenCourses: false,
                userTakenCourses: new Set(),
                plannerRoadmaps: [],
            });

            return logoutUrl;
        },

        setGoogleId: (id) => set({ googleId: id }),
        setFilterTakenCourses: (value) => set({ filterTakenCourses: value }),
        setUserTakenCourses: (courses) => set({ userTakenCourses: courses }),
        setPlannerRoadmaps: (roadmaps) => set({ plannerRoadmaps: roadmaps }),
    };
});

import trpc from '$lib/api/trpc';
import { setWasLoggedIn } from '$lib/localStorage';
import { clearSsoCookie } from '$lib/ssoCookie';
import type { Roadmap } from '@packages/antalmanac-types';
import { TRPCClientError } from '@trpc/client';
import { create } from 'zustand';

interface SessionState {
    userId: string | null;
    isGoogleUser: boolean;
    email: string | null;
    name: string | null;
    avatar: string | null;
    sessionIsValid: boolean;
    loadSession: () => Promise<boolean>;
    clearSession: () => Promise<string | null>;

    hasCheckedAuth: boolean;

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
    // Clean up stale localStorage token from before the cookie migration
    window.localStorage.removeItem('sessionId');

    return {
        userId: null,
        isGoogleUser: false,
        email: null,
        name: null,
        avatar: null,
        sessionIsValid: false,
        hasCheckedAuth: false,
        googleId: null,
        filterTakenCourses: false,
        userTakenCourses: new Set(),
        plannerRoadmaps: [],
        isPlannerLoading: false,

        loadSession: async () => {
            try {
                const { users, accounts } = await trpc.userData.getUserAndAccount.query();

                let googleId = accounts?.providerAccountId ?? null;
                if (googleId?.startsWith('google_')) {
                    googleId = googleId.slice('google_'.length);
                }

                set({
                    sessionIsValid: true,
                    hasCheckedAuth: true,
                    userId: users.id,
                    isGoogleUser: Boolean(users.email),
                    email: users.email ?? null,
                    name: users.name ?? null,
                    avatar: users.avatar ?? null,
                    googleId,
                });

                setWasLoggedIn(true);
                return true;
            } catch (error) {
                const isUnauthorized = error instanceof TRPCClientError && error.data?.code === 'UNAUTHORIZED';

                if (!isUnauthorized) {
                    console.error('Failed to load session:', error);
                }

                set({
                    sessionIsValid: false,
                    hasCheckedAuth: true,
                    userId: null,
                    isGoogleUser: false,
                    email: null,
                    name: null,
                    avatar: null,
                    googleId: null,
                });
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

            setWasLoggedIn(false);
            clearSsoCookie();
            set({
                userId: null,
                sessionIsValid: false,
                isGoogleUser: false,
                email: null,
                name: null,
                avatar: null,
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
        setIsPlannerLoading: (isPlannerLoading) => set({ isPlannerLoading }),
    };
});

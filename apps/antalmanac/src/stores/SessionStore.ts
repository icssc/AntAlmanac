import type { Roadmap } from '@packages/antalmanac-types';
import { create } from 'zustand';

import { authClient, SessionData } from '$lib/auth/authClient';
import { getLocalStorageSessionId } from '$lib/localStorage';
import { clearSsoCookie } from '$lib/ssoCookie';
import { useNotificationStore } from '$stores/NotificationStore';

interface SessionState {
    session: string | null;
    userId: string | null;
    isGoogleUser: boolean;
    email: string | null;
    sessionIsValid: boolean;
    updateSession: (session: SessionData) => Promise<boolean>;
    clearSession: () => Promise<void>;

    googleId: string | null;
    filterTakenCourses: boolean;
    userTakenCourses: Set<string>;

    plannerRoadmaps: Roadmap[];

    setGoogleId: (id: string) => void;
    setFilterTakenCourses: (value: boolean) => void;
    setUserTakenCourses: (courses: Set<string>) => void;
    setPlannerRoadmaps: (roadmaps: Roadmap[]) => void;
}

export const useSessionStore = create<SessionState>((set, get) => {
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
        updateSession: async (sessionData: SessionData) => {
            if (typeof sessionData !== 'object') {
                return false;
            }

            const { data: accountInfo } = await authClient.accountInfo();
            if (!accountInfo) {
                console.error('FIXME');
                return false;
            }

            const googleAccountData = accountInfo.user;

            // Remove "google" prefix
            const googleId = googleAccountData.id.toString().split('_')[1];
            set({
                session: sessionData.session.id,
                sessionIsValid: true,
                userId: sessionData.user.id,
                isGoogleUser: true,
                googleId: googleId,
                email: sessionData.user.email,
            });
            useNotificationStore.getState().loadNotifications();
            return true;
        },
        clearSession: async () => {
            const currentSession = get().session;
            if (currentSession) {
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
                });
                window.location.reload();
            }
        },
        setGoogleId: (id) => set({ googleId: id }),
        setFilterTakenCourses: (value) => set({ filterTakenCourses: value }),
        setUserTakenCourses: (courses) => set({ userTakenCourses: courses }),
        setPlannerRoadmaps: (roadmaps) => set({ plannerRoadmaps: roadmaps }),
    };
});

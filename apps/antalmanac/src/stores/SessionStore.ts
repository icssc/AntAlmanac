import type { Roadmap } from '@packages/antalmanac-types';
import { create } from 'zustand';

import { authClient, SessionData } from '$lib/auth/authClient';
import { clearSsoCookie } from '$lib/ssoCookie';

interface SessionState {
    session: SessionData['session'] | null;
    sessionId: string | null;
    user: SessionData['user'] | null;
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

    setFilterTakenCourses: (value: boolean) => void;
    setUserTakenCourses: (courses: Set<string>) => void;
    setPlannerRoadmaps: (roadmaps: Roadmap[]) => void;
}

export const useSessionStore = create<SessionState>((set, get) => {
    return {
        session: null,
        sessionId: null,
        user: null,
        userId: null,
        isGoogleUser: false,
        email: null,
        sessionIsValid: false,
        googleId: null,
        filterTakenCourses: false,
        userTakenCourses: new Set(),
        plannerRoadmaps: [],
        updateSession: async (sessionData: SessionData) => {
            const { data, error } = await authClient.listAccounts();
            if (!data || error) {
                console.error('Error occurred while getting account info:', error);
                return false;
            }
            const [accountInfo] = data;

            // Remove "google" prefix
            const googleId = accountInfo.userId.toString().split('_')[1];
            set({
                session: sessionData.session,
                sessionId: sessionData.session.id,
                sessionIsValid: true,
                user: sessionData.user,
                userId: sessionData.user.id,
                isGoogleUser: true,
                googleId: googleId,
                email: sessionData.user.email,
            });
            return true;
        },
        clearSession: async () => {
            const currentSession = get().sessionId;
            if (currentSession) {
                clearSsoCookie();
                set({
                    session: null,
                    sessionId: null,
                    user: null,
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
        setFilterTakenCourses: (value) => set({ filterTakenCourses: value }),
        setUserTakenCourses: (courses) => set({ userTakenCourses: courses }),
        setPlannerRoadmaps: (roadmaps) => set({ plannerRoadmaps: roadmaps }),
    };
});

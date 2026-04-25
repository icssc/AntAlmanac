import { getGoogleAccount, SessionData } from '$lib/auth/authClient';
import { setWasLoggedIn } from '$lib/localStorage';
import { clearSsoCookie } from '$lib/ssoCookie';
import type { Roadmap } from '@packages/antalmanac-types';
import { create } from 'zustand';

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

    isNewUser: boolean;
    setIsNewUser: (isNewUser: boolean) => void;

    areSchedulesLoaded: boolean;
    setAreSchedulesLoaded: (areSchedulesLoaded: boolean) => void;

    filterTakenCourses: boolean;
    userTakenCourses: Set<string>;

    plannerRoadmaps: Roadmap[];

    setFilterTakenCourses: (value: boolean) => void;
    setUserTakenCourses: (courses: Set<string>) => void;
    setPlannerRoadmaps: (roadmaps: Roadmap[]) => void;
}

const initState: Pick<
    SessionState,
    { [K in keyof SessionState]: SessionState[K] extends Function ? never : K }[keyof SessionState]
> = {
    session: null,
    sessionId: null,
    user: null,
    userId: null,
    isGoogleUser: false,
    email: null,
    sessionIsValid: false,
    googleId: null,
    isNewUser: false,
    areSchedulesLoaded: false,
    filterTakenCourses: false,
    userTakenCourses: new Set(),
    plannerRoadmaps: [],
};

export const useSessionStore = create<SessionState>((set, get) => {
    // Clean up stale localStorage token from before the cookie migration
    window.localStorage.removeItem('sessionId');

    return {
        ...initState,
        updateSession: async (sessionData: SessionData) => {
            const accountInfo = await getGoogleAccount();
            if (!accountInfo) {
                return false;
            }

            set({
                session: sessionData.session,
                sessionId: sessionData.session.id,
                sessionIsValid: true,
                user: sessionData.user,
                userId: sessionData.user.id,
                isGoogleUser: true,
                googleId: accountInfo.userId,
                email: sessionData.user.email,
            });
            setWasLoggedIn(true);
            return true;
        },

        clearSession: async () => {
            const currentSession = get().sessionId;
            if (currentSession) {
                clearSsoCookie();
                set({ ...initState });
            }

            setWasLoggedIn(false);
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
        },
        setIsNewUser: (isNewUser) => set({ isNewUser: isNewUser }),
        setAreSchedulesLoaded: (areSchedulesLoaded) => set({ areSchedulesLoaded: areSchedulesLoaded }),
        setFilterTakenCourses: (value) => set({ filterTakenCourses: value }),
        setUserTakenCourses: (courses) => set({ userTakenCourses: courses }),
        setPlannerRoadmaps: (roadmaps) => set({ plannerRoadmaps: roadmaps }),
    };
});

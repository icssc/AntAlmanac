import { SessionData } from '$lib/auth/authClient';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const LEGACY_USER_ID_KEY = 'userID';
const LEGACY_WAS_LOGGED_IN_KEY = 'wasLoggedIn';

interface SessionState {
    session: SessionData['session'] | null;
    sessionId: string | null;
    user: SessionData['user'] | null;
    userId: string | null;
    email: string | null;
    name: string | null;
    avatar: string | null;
    sessionIsValid: boolean;
    updateSession: (session: SessionData) => Promise<void>;

    hasCheckedAuth: boolean;
    setHasCheckedAuth: (hasCheckedAuth: boolean) => void;

    isNewUser: boolean;
    setIsNewUser: (isNewUser: boolean) => void;

    areSchedulesLoaded: boolean;
    setAreSchedulesLoaded: (areSchedulesLoaded: boolean) => void;

    /** Guest username from "remember me" on legacy load flow. */
    rememberedGuestUsername: string | null;
    setRememberedGuestUsername: (username: string) => void;
    clearRememberedGuestUsername: () => void;

    /** Whether the user had a valid session before the current page load. */
    wasPreviouslyLoggedIn: boolean;
    setWasPreviouslyLoggedIn: (value: boolean) => void;
}

function migrateLegacySessionKeys(): Pick<SessionState, 'rememberedGuestUsername' | 'wasPreviouslyLoggedIn'> {
    if (typeof window === 'undefined') {
        return { rememberedGuestUsername: null, wasPreviouslyLoggedIn: false };
    }

    let rememberedGuestUsername: string | null = null;
    let wasPreviouslyLoggedIn = false;

    const legacyUserId = window.localStorage.getItem(LEGACY_USER_ID_KEY);
    if (legacyUserId) {
        rememberedGuestUsername = legacyUserId;
        window.localStorage.removeItem(LEGACY_USER_ID_KEY);
    }

    if (window.localStorage.getItem(LEGACY_WAS_LOGGED_IN_KEY) === 'true') {
        wasPreviouslyLoggedIn = true;
        window.localStorage.removeItem(LEGACY_WAS_LOGGED_IN_KEY);
    }

    return { rememberedGuestUsername, wasPreviouslyLoggedIn };
}

export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
            session: null,
            sessionId: null,
            user: null,
            userId: null,
            email: null,
            name: null,
            avatar: null,
            sessionIsValid: false,
            hasCheckedAuth: false,
            isNewUser: false,
            areSchedulesLoaded: false,
            rememberedGuestUsername: null,
            wasPreviouslyLoggedIn: false,

            updateSession: async (sessionData: SessionData) => {
                set({
                    session: sessionData.session,
                    sessionId: sessionData.session.id,
                    user: sessionData.user,
                    userId: sessionData.user.id,
                    sessionIsValid: true,
                    email: sessionData.user.email,
                    name: sessionData.user.name,
                    avatar: sessionData.user.avatar,
                });
            },

            setHasCheckedAuth: (hasCheckedAuth) => set({ hasCheckedAuth }),
            setIsNewUser: (isNewUser) => set({ isNewUser: isNewUser }),
            setAreSchedulesLoaded: (areSchedulesLoaded) => set({ areSchedulesLoaded: areSchedulesLoaded }),
            setRememberedGuestUsername: (username) => set({ rememberedGuestUsername: username }),
            clearRememberedGuestUsername: () => set({ rememberedGuestUsername: null }),
            setWasPreviouslyLoggedIn: (value) => set({ wasPreviouslyLoggedIn: value }),
        }),
        {
            name: 'aa-session',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                rememberedGuestUsername: state.rememberedGuestUsername,
                wasPreviouslyLoggedIn: state.wasPreviouslyLoggedIn,
            }),
            merge: (persisted, current) => {
                const legacy = migrateLegacySessionKeys();
                const stored = persisted as Partial<
                    Pick<SessionState, 'rememberedGuestUsername' | 'wasPreviouslyLoggedIn'>
                >;

                return {
                    ...current,
                    rememberedGuestUsername: stored.rememberedGuestUsername ?? legacy.rememberedGuestUsername,
                    wasPreviouslyLoggedIn: stored.wasPreviouslyLoggedIn ?? legacy.wasPreviouslyLoggedIn,
                };
            },
        }
    )
);

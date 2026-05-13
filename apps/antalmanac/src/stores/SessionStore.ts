import { SessionData } from '$lib/auth/authClient';
import { create } from 'zustand';

interface SessionState {
    session: SessionData['session'] | null;
    sessionId: string | null;
    user: SessionData['user'] | null;
    userId: string | null;
    isGoogleUser: boolean;
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
}

export const useSessionStore = create<SessionState>((set) => {
    return {
        session: null,
        sessionId: null,
        user: null,
        userId: null,
        isGoogleUser: false,
        email: null,
        name: null,
        avatar: null,
        sessionIsValid: false,
        hasCheckedAuth: false,
        isNewUser: false,
        areSchedulesLoaded: false,

        updateSession: async (sessionData: SessionData) => {
            set({
                session: sessionData.session,
                sessionId: sessionData.session.id,
                sessionIsValid: true,
                user: sessionData.user,
                userId: sessionData.user.id,
                isGoogleUser: true,
                email: sessionData.user.email,
                name: sessionData.user.name,
                avatar: sessionData.user.avatar,
            });
        },

        setHasCheckedAuth: (hasCheckedAuth) => set({ hasCheckedAuth }),
        setIsNewUser: (isNewUser) => set({ isNewUser: isNewUser }),
        setAreSchedulesLoaded: (areSchedulesLoaded) => set({ areSchedulesLoaded: areSchedulesLoaded }),
    };
});

import { getGoogleAccount, SessionData } from '$lib/auth/authClient';
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
    updateSession: (session: SessionData) => Promise<boolean>;

    hasCheckedAuth: boolean;
    setHasCheckedAuth: (hasCheckedAuth: boolean) => void;

    googleId: string | null;
    setGoogleId: (id: string) => void;

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
        googleId: null,
        isNewUser: false,
        areSchedulesLoaded: false,

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
                googleId: accountInfo.accountId,
                email: sessionData.user.email,
                name: sessionData.user.name,
                avatar: sessionData.user.avatar,
            });
            return true;
        },

        setHasCheckedAuth: (hasCheckedAuth) => set({ hasCheckedAuth }),
        setGoogleId: (id) => set({ googleId: id }),
        setIsNewUser: (isNewUser) => set({ isNewUser: isNewUser }),
        setAreSchedulesLoaded: (areSchedulesLoaded) => set({ areSchedulesLoaded: areSchedulesLoaded }),
    };
});

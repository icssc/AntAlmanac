import trpc from '$lib/api/trpc';
import { setWasLoggedIn } from '$lib/localStorage';
import { clearSsoCookie } from '$lib/ssoCookie';
import { usePlannerStore } from '$stores/PlannerStore';
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
    setGoogleId: (id: string) => void;
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

                usePlannerStore.getState().loadPlannerRoadmaps(googleId);

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
            });

            return logoutUrl;
        },

        setGoogleId: (id) => set({ googleId: id }),
    };
});

import { trpc } from '$lib/api/trpc';
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
    clearSession: () => void;

    hasCheckedAuth: boolean;
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

        loadSession: async () => {
            try {
                const { users } = await trpc.auth.getUserAndAccount.query();

                set({
                    sessionIsValid: true,
                    hasCheckedAuth: true,
                    userId: users.id,
                    isGoogleUser: Boolean(users.email),
                    email: users.email ?? null,
                    name: users.name ?? null,
                    avatar: users.avatar ?? null,
                });

                usePlannerStore.getState().loadPlannerRoadmaps();

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
                });
                return false;
            }
        },

        clearSession: () => {
            setWasLoggedIn(false);
            clearSsoCookie();
            set({
                userId: null,
                sessionIsValid: false,
                isGoogleUser: false,
                email: null,
                name: null,
                avatar: null,
            });
        },
    };
});

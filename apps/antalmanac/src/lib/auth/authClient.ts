import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { setWasLoggedIn } from '$lib/localStorage';
import { getErrorMessage } from '$lib/utils';
import type { auth } from '$src/lib/auth/auth';
import { useSessionStore } from '$stores/SessionStore';
import { genericOAuthClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { PostHog } from 'posthog-js';

interface SignOutOptions {
    onLogoutComplete?: () => void;
    postHog?: PostHog;
}

export const authClient = createAuthClient({
    plugins: [genericOAuthClient(), inferAdditionalFields<typeof auth>()],
});

export type SessionData = typeof authClient.$Infer.Session;

export async function signOut({ onLogoutComplete, postHog }: SignOutOptions = {}) {
    const session = useSessionStore.getState().session;
    if (!session) {
        onLogoutComplete?.();
        setWasLoggedIn(false);
        await useSessionStore.getState().clearSession();
        window.location.reload();
        return;
    }

    const { error } = await authClient.signOut();

    if (error) {
        console.error('Error during logout', error);
    }

    try {
        onLogoutComplete?.();
        setWasLoggedIn(false);
        await useSessionStore.getState().clearSession();

        const { logoutUrl } = await trpc.userData.getLogoutUrl.query({
            redirectUrl: window.location.origin,
        });

        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SIGN_OUT,
        });

        window.location.href = logoutUrl;
    } catch (error) {
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SIGN_OUT_FAIL,
            error: getErrorMessage(error),
        });
        console.error('Error during logout', error);
    } finally {
        postHog?.reset();
    }
}

/**
 * Returns the current user's google account info if valid, `null` if invalid.
 */
export async function getGoogleAccount() {
    const { data, error } = await authClient.listAccounts();
    if (!data || data.length === 0 || error) {
        console.error('Error occurred while getting account info:', error);
        return null;
    }
    const [account] = data;
    return account;
}

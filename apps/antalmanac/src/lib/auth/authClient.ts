import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { getGoogleAccountFromData } from '$lib/auth/authUtils';
import { setWasLoggedIn } from '$lib/localStorage';
import { clearSsoCookie } from '$lib/ssoCookie';
import { getErrorMessage } from '$lib/utils';
import type { auth } from '$src/lib/auth/auth';
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
    let logoutUrl;
    try {
        logoutUrl = await trpc.auth.getLogoutUrl.query({
            redirectUrl: window.location.origin,
        });
    } catch (error) {
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SIGN_OUT_FAIL,
            error: getErrorMessage(error),
        });
        console.error('Error getting logout URL', error);
    }

    clearSsoCookie();
    setWasLoggedIn(false);
    onLogoutComplete?.();

    const { error } = await authClient.signOut();
    if (error) {
        console.error('Error during logout', error);
    }

    logAnalytics(postHog, {
        category: analyticsEnum.auth,
        action: analyticsEnum.auth.actions.SIGN_OUT,
    });

    postHog?.reset();

    if (logoutUrl) {
        window.location.href = logoutUrl;
    } else {
        window.location.reload();
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
    return getGoogleAccountFromData(data);
}

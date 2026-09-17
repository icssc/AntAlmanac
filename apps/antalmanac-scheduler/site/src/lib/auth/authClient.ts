import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { getSignOutUrl } from '$lib/auth/authActions';
import { setWasLoggedIn } from '$lib/localStorage';
import { clearSsoCookie } from '$lib/ssoCookie';
import { getErrorMessage } from '$lib/utils';
import type { auth } from '$src/lib/auth/auth';
import { openSnackbar } from '$stores/SnackbarStore';
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
    let logoutUrl: string | null = null;
    try {
        logoutUrl = await getSignOutUrl(window.location.origin);
    } catch (error) {
        logAnalytics(postHog, {
            category: analyticsEnum.auth,
            action: analyticsEnum.auth.actions.SIGN_OUT_FAIL,
            error: getErrorMessage(error),
        });
        console.error('Error getting logout URL', error);
        openSnackbar('error', 'Error occurred while getting logout URL');
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

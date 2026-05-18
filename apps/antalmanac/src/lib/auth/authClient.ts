import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpc } from '$lib/api/trpc';
import { AUTH_PROVIDER_ID } from '$lib/auth/authConstants';
import { AuthAdditionalData, Provider } from '$lib/auth/authTypes';
import { getProviderIcsscName } from '$lib/auth/authUtils';
import { setWasLoggedIn } from '$lib/localStorage';
import { clearSsoCookie } from '$lib/ssoCookie';
import { getErrorMessage } from '$lib/utils';
import type { auth, AuthorizationUrlParams } from '$src/lib/auth/auth';
import { genericOAuthClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { PostHog } from 'posthog-js';

interface GetSignInUrlOptions {
    authorizationUrlParams?: AuthorizationUrlParams;
    redirectUrl?: string;
}

interface SignOutOptions {
    onLogoutComplete?: () => void;
    postHog?: PostHog;
}

export const authClient = createAuthClient({
    plugins: [genericOAuthClient(), inferAdditionalFields<typeof auth>()],
});

export type SessionData = typeof authClient.$Infer.Session;

export async function getSignInUrl(
    provider: Provider,
    { authorizationUrlParams, redirectUrl }: GetSignInUrlOptions = {}
) {
    const response = await authClient.signIn.oauth2({
        providerId: AUTH_PROVIDER_ID,
        newUserCallbackURL: '/welcome',
        callbackURL: redirectUrl,
        additionalData: {
            returnUrl: `${window.location.pathname}${window.location.search}${window.location.hash}`,
            provider,
        } satisfies AuthAdditionalData,
    });
    if (response.error) {
        return { error: response.error };
    }
    const authUrl = new URL(response.data.url);
    for (const [key, val] of Object.entries(authorizationUrlParams ?? {})) {
        authUrl.searchParams.set(key, val);
    }
    authUrl.searchParams.set('provider', getProviderIcsscName(provider));
    return { url: authUrl.toString() };
}

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

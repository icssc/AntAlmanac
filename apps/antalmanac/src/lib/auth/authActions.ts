'use server';

import { auth, AuthAdditionalData, AuthorizationUrlParams } from '$lib/auth/auth';
import { AUTH_PROVIDER_ID } from '$lib/auth/authConstants';
import { Provider } from '$lib/auth/authTypes';
import { getIcsscProviderName } from '$lib/auth/authUtils';
import { headers } from 'next/headers';

interface GetSignInUrlOptions {
    authorizationUrlParams?: AuthorizationUrlParams;
    redirectUrl?: string;
    returnUrl?: string;
}

export async function getSignInUrl(
    provider: Provider,
    { authorizationUrlParams, redirectUrl, returnUrl }: GetSignInUrlOptions = {}
) {
    const { url } = await auth.api.signInWithOAuth2({
        body: {
            providerId: AUTH_PROVIDER_ID,
            newUserCallbackURL: '/welcome',
            callbackURL: redirectUrl,
            additionalData: {
                returnUrl,
                provider,
            } satisfies AuthAdditionalData,
        },
    });
    const authUrl = new URL(url);
    for (const [key, val] of Object.entries(authorizationUrlParams ?? {})) {
        authUrl.searchParams.set(key, val);
    }
    authUrl.searchParams.set('provider', getIcsscProviderName(provider));
    return authUrl.toString();
}

export async function fetchGoogleAccount() {
    try {
        const accounts = await auth.api.listUserAccounts({ headers: await headers() });
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts were found');
        }
        const [account] = accounts;
        return account;
    } catch (error) {
        console.error('Error occurred while fetching account info:', error);
        return null;
    }
}

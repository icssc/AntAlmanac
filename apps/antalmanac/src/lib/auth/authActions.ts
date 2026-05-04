'use server';

import { auth, AuthAdditionalData, AuthorizationUrlParams } from '$lib/auth/auth';
import { AUTH_PROVIDER_ID } from '$lib/constants';
import { headers } from 'next/headers';

interface GetSignInUrlOptions {
    authorizationUrlParams?: AuthorizationUrlParams;
    redirectUrl?: string;
    returnUrl?: string;
}

export async function getSignInUrl({ authorizationUrlParams, redirectUrl, returnUrl }: GetSignInUrlOptions = {}) {
    // TODO: Remove this hack once better-auth supports dynamic prompts/config
    auth.options.plugins[0].options.config[0].authorizationUrlParams = authorizationUrlParams;

    return await auth.api.signInWithOAuth2({
        body: {
            providerId: AUTH_PROVIDER_ID,
            newUserCallbackURL: '/welcome',
            callbackURL: redirectUrl,
            additionalData: {
                returnUrl,
            } satisfies AuthAdditionalData,
        },
    });
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
        console.error('Error occurred while getting account info:', error);
        return null;
    }
}

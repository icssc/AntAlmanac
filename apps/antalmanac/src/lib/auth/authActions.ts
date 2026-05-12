'use server';

import { auth, AuthAdditionalData, AuthorizationUrlParams } from '$lib/auth/auth';
import { AUTH_PROVIDER_ID } from '$lib/auth/authConstants';
import { Provider } from '$lib/auth/authTypes';
import { getIcsscProviderName } from '$lib/auth/authUtils';

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

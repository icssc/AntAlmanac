'use server';
import { auth, type AuthorizationUrlParams } from '$lib/auth/auth';
import { AUTH_PROVIDER_ID } from '$lib/auth/authConstants';
import { type AuthAdditionalData, Provider } from '$lib/auth/authTypes';
import { getProviderIcsscName } from '$lib/auth/authUtils';
import { getNativeIosRedirectUri } from '$lib/platform';
import { env } from '$src/env';

interface GetSignInUrlOptions {
    authorizationUrlParams?: AuthorizationUrlParams;
    returnUrl?: string;
    isNativeIosApp?: boolean;
}

export async function getSignInUrl(
    provider: Provider,
    { authorizationUrlParams, returnUrl, isNativeIosApp }: GetSignInUrlOptions = {}
) {
    const { url } = await auth.api.signInWithOAuth2({
        body: {
            providerId: AUTH_PROVIDER_ID,
            newUserCallbackURL: '/welcome',
            callbackURL: isNativeIosApp ? getNativeIosRedirectUri(env.BETTER_AUTH_URL) : undefined,
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
    authUrl.searchParams.set('provider', getProviderIcsscName(provider));
    return authUrl.toString();
}

export async function getSignOutUrl(redirectUrl: string) {
    const oidcLogoutUrl = new URL(`${env.OIDC_ISSUER_URL}/logout`);
    const redirectTo = redirectUrl || env.BETTER_AUTH_URL;
    oidcLogoutUrl.searchParams.set('post_logout_redirect_uri', redirectTo);
    return oidcLogoutUrl.toString();
}

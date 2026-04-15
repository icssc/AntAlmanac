'use server';

import { auth, AUTH_PROVIDER_ID, AuthorizationUrlParams } from '$lib/auth/auth';

export async function getSignInUrl(authorizationUrlParams?: AuthorizationUrlParams) {
    // Workaround so `AutoSIgnIn` can pass `prompt: none` since better-auth currently doesn't support this
    auth.options.plugins[0].options.config[0].authorizationUrlParams = authorizationUrlParams;

    return await auth.api.signInWithOAuth2({
        body: {
            providerId: AUTH_PROVIDER_ID,
            newUserCallbackURL: '/welcome',
        },
    });
}

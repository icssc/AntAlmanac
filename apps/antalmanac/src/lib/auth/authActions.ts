'use server';

import { auth, AUTH_PROVIDER_ID } from '$lib/auth/auth';

export async function signIn() {
    return await auth.api.signInWithOAuth2({
        body: {
            providerId: AUTH_PROVIDER_ID,
            newUserCallbackURL: '/welcome',
        },
    });
}

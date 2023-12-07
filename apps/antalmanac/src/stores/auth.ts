import { parse } from 'cookie';
import { decodeJwt } from 'jose';
import { create } from 'zustand';
import { GoogleUserSchema } from '@packages/antalmanac-types';

export interface AuthStore {
    user?: typeof GoogleUserSchema.infer;
}

export const useAuthStore = create<AuthStore>(() => {
    return {
        user: getUser(),
    };
});

export function getUser() {
    const googleIdToken = getGoogleToken();

    if (googleIdToken == null) {
        return;
    }

    const jwt = decodeJwt(googleIdToken);

    const result = GoogleUserSchema(jwt);

    return result.data;
}

/**
 * Attempts to retreive a Google ID token from cookies.
 */
export function getGoogleToken() {
    if (typeof document === 'undefined') {
        return;
    }

    const googleIdToken = parse(document.cookie).access_token;

    return googleIdToken;
}

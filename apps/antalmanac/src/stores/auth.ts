import { parse } from 'cookie';
import { decodeJwt } from 'jose';
import { create } from 'zustand';
import { GoogleUserSchema } from '@packages/antalmanac-types';
import { CredentialResponse } from '@react-oauth/google';

export interface AuthStore {
    user?: typeof GoogleUserSchema.infer;
    setUser: (credentialResponse: CredentialResponse) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
    return {
        user: getUser(),
        setUser: (credentialResponse) => {
            document.cookie = `access_token=${credentialResponse.credential}; path=/;`;

            if (credentialResponse.credential) {
                set({
                    user: decodeJwt(credentialResponse.credential),
                });
            }
        },
        logout: () => {
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            set({
                user: undefined,
            });
        },
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

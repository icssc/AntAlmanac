import { parse } from 'cookie';
import { decodeJwt } from 'jose';
import { create } from 'zustand';
import { GoogleUserSchema, type GoogleUser } from '@packages/antalmanac-types';
import { CredentialResponse } from '@react-oauth/google';

export type UserType = 'google' | 'code';

export interface User extends GoogleUser {
    type: UserType;
}

export interface AuthStore {
    user?: User;
    setCodeUser: (username: string) => void;
    setGoogleUser: (credentialResponse: CredentialResponse) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
    return {
        user: getUser(),
        setCodeUser: (username: string) => {
            set({
                user: {
                    type: 'code',
                    sub: username,
                    name: username,
                    email: username,
                },
            });
        },
        setGoogleUser: (credentialResponse) => {
            document.cookie = `access_token=${credentialResponse.credential}; path=/;`;

            if (credentialResponse.credential) {
                set({
                    user: {
                        ...decodeJwt(credentialResponse.credential),
                        type: 'google',
                    },
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

export function getUser(): User | undefined {
    const googleIdToken = getGoogleToken();

    if (googleIdToken == null) {
        return;
    }

    const jwt = decodeJwt(googleIdToken);

    const result = GoogleUserSchema(jwt);

    return result.data ? { type: 'google', ...result.data } : undefined;
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

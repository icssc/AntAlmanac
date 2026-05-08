import { isNativeIosApp } from '$lib/platform';

interface AppleSignInResult {
    identityToken: string;
    fullName?: {
        givenName?: string;
        familyName?: string;
    };
}

interface AppleSignInError {
    error: string;
}

type AppleSignInResponse = AppleSignInResult | AppleSignInError;

function isError(response: AppleSignInResponse): response is AppleSignInError {
    return 'error' in response;
}

/**
 * Triggers Sign in with Apple via the native iOS handler or the web JS SDK.
 * Returns the identity token and optional name, or throws on failure/cancel.
 */
export async function requestAppleSignIn(): Promise<AppleSignInResult> {
    if (isNativeIosApp()) {
        return requestAppleSignInNative();
    }
    return requestAppleSignInWeb();
}

/**
 * iOS native path: sends a message to the Swift WKScriptMessageHandler and
 * waits for the callback via `window.__appleSignInCallback`.
 */
function requestAppleSignInNative(): Promise<AppleSignInResult> {
    return new Promise((resolve, reject) => {
        (window as unknown as Record<string, unknown>).__appleSignInCallback = (response: AppleSignInResponse) => {
            delete (window as unknown as Record<string, unknown>).__appleSignInCallback;
            if (isError(response)) {
                reject(new Error(response.error));
            } else {
                resolve(response);
            }
        };

        window.webkit?.messageHandlers?.['apple-sign-in']?.postMessage(null);
    });
}

declare global {
    interface Window {
        AppleID?: {
            auth: {
                init: (config: Record<string, unknown>) => void;
                signIn: () => Promise<{
                    authorization: {
                        id_token: string;
                        code: string;
                    };
                    user?: {
                        name?: { firstName?: string; lastName?: string };
                        email?: string;
                    };
                }>;
            };
        };
        webkit?: {
            messageHandlers?: Record<string, { postMessage: (body: unknown) => void } | undefined>;
        };
    }
}

let sdkLoaded = false;

function loadAppleJsSdk(): Promise<void> {
    if (sdkLoaded && window.AppleID) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        if (document.getElementById('apple-signin-sdk')) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.id = 'apple-signin-sdk';
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.onload = () => {
            sdkLoaded = true;
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Apple Sign In SDK'));
        document.head.appendChild(script);
    });
}

async function requestAppleSignInWeb(): Promise<AppleSignInResult> {
    await loadAppleJsSdk();

    if (!window.AppleID) {
        throw new Error('Apple Sign In SDK not available');
    }

    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    if (!clientId) {
        throw new Error('Apple client ID not configured');
    }

    window.AppleID.auth.init({
        clientId,
        scope: 'name email',
        redirectURI: window.location.origin + '/auth',
        usePopup: true,
    });

    const response = await window.AppleID.auth.signIn();

    return {
        identityToken: response.authorization.id_token,
        fullName: response.user?.name
            ? {
                  givenName: response.user.name.firstName,
                  familyName: response.user.name.lastName,
              }
            : undefined,
    };
}

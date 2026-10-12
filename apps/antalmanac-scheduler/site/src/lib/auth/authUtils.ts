import { Provider } from '$lib/auth/authTypes';

export const getSafeAuthRedirectPath = (
    redirectUrl: string | null | undefined,
    requestUrl: string | null | undefined,
    allowedOrigin: string
): string => {
    if (!redirectUrl) {
        return '/';
    }

    try {
        const requestOrigin = requestUrl ? new URL(requestUrl).origin : allowedOrigin;
        const url = new URL(redirectUrl, requestOrigin);
        if (url.origin === allowedOrigin) {
            return url.toString();
        }
        return '/';
    } catch {
        return '/';
    }
};

export function getProviderDisplayName(provider: Provider) {
    switch (provider) {
        case Provider.Google:
            return 'Google';
        case Provider.Apple:
            return 'Apple';
        default:
            console.error('Unrecognized provider:', provider);
            return '';
    }
}

export function getProviderIcsscName(provider: Provider) {
    switch (provider) {
        case Provider.Google:
            return 'google';
        case Provider.Apple:
            return 'apple';
        default:
            console.error('Unrecognized provider:', provider);
            return '';
    }
}

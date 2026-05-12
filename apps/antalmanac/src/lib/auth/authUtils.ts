import { Accounts } from '$lib/auth/auth';
import { Provider } from '$lib/auth/authTypes';

export function removeGoogleIdPrefix(prefixedGoogleId: string) {
    return prefixedGoogleId.replace('google_', '');
}

export function getAuthReturnUrl() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export const getSafeAuthRedirectPath = (
    redirectUrl: string | null | undefined,
    requestUrl: string,
    fallbackRequestUrl: string
): string => {
    if (!redirectUrl) {
        return '/';
    }

    let requestOrigin: string;
    try {
        requestOrigin = new URL(requestUrl).origin;
    } catch {
        requestOrigin = new URL(fallbackRequestUrl).origin;
    }

    const candidates: string[] = [];
    try {
        const decodedRedirectUrl = decodeURIComponent(redirectUrl);
        candidates.push(decodedRedirectUrl);
    } catch {
        // Ignore malformed encoding and continue with the raw value.
    }

    if (!candidates.includes(redirectUrl)) {
        candidates.push(redirectUrl);
    }

    for (const candidate of candidates) {
        try {
            const parsedRedirectUrl = new URL(candidate, requestOrigin);
            if (parsedRedirectUrl.origin === requestOrigin) {
                return `${parsedRedirectUrl.pathname}${parsedRedirectUrl.search}${parsedRedirectUrl.hash}`;
            }
        } catch {
            // Ignore malformed candidate and try next.
        }
    }

    return '/';
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

export function getIcsscProviderName(provider: Provider) {
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

function getAccountTypeFromId(accountId: string) {
    const prefix = accountId.split('_')[0];
    switch (prefix) {
        case 'google':
            return Provider.Google;
        case 'apple':
            return Provider.Apple;
        default:
            throw new Error(`Unknown provider prefix: ${prefix}`);
    }
}

export function getGoogleAccountFromData(accounts: Accounts) {
    return accounts.find((account) => getAccountTypeFromId(account.accountId) === Provider.Google);
}

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId } from '$lib/localStorage';
import { isNativeIosApp } from '$lib/platform';
import { hasSsoCookie } from '$lib/ssoCookie';
import { useEffect, useRef } from 'react';

/**
 * Automatically signs in users who authenticated via another app on antalmanac.com
 * (e.g. Planner at /planner).
 *
 * Uses a shared first-party cookie (`icssc_logged_in`) as a hint, then performs
 * a redirect-based silent auth through auth.icssc.club with prompt=none.
 * Unlike the previous iframe approach this avoids third-party cookie issues.
 */
export function AutoSignIn() {
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) {
            return;
        }
        hasChecked.current = true;

        const checkAndSignIn = async () => {
            // Don't interfere when AuthPage is already handling an OAuth callback.
            // Calling getGoogleAuthUrl here would overwrite the oauth_state /
            // oauth_code_verifier cookies that AuthPage needs to finish the exchange.
            if (window.location.pathname === '/auth') {
                return;
            }

            if (isNativeIosApp()) {
                return;
            }

            if (!hasSsoCookie()) {
                return;
            }

            if (getLocalStorageSessionId()) {
                return;
            }

            try {
                const authUrl = await trpc.userData.getGoogleAuthUrl.query({ prompt: 'none' });
                window.location.href = authUrl.toString();
            } catch {
                // Silent SSO failed (e.g. backend unavailable). Don't retry.
            }
        };

        checkAndSignIn();
    }, []);

    return null;
}

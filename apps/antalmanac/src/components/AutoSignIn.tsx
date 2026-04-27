import trpc from '$lib/api/trpc';
import { setLocalStorageAuthReturnPath } from '$lib/localStorage';
import { hasSsoCookie } from '$lib/ssoCookie';
import { useSessionStore } from '$stores/SessionStore';
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
            if (window.location.pathname === '/auth' || window.location.pathname === '/auth/native') {
                return;
            }

            if (!hasSsoCookie()) {
                return;
            }

            if (useSessionStore.getState().sessionIsValid) {
                return;
            }

            const loaded = await useSessionStore.getState().loadSession();
            if (loaded) {
                return;
            }

            try {
                setLocalStorageAuthReturnPath(window.location.pathname + window.location.search + window.location.hash);
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

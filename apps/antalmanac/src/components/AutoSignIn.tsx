import { useEffect, useRef } from 'react';

import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId } from '$lib/localStorage';
import { hasSsoCookie } from '$lib/ssoCookie';

/**
 * Automatically signs in users who authenticated via another app on antalmanac.com
 * (e.g. PeterPortal at /planner).
 *
 * Uses a shared first-party cookie (`icssc_logged_in`) as a hint, then performs
 * a redirect-based silent auth through auth.icssc.club with prompt=none.
 * Unlike the previous iframe approach this avoids third-party cookie issues.
 */
export function AutoSignIn() {
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkAndSignIn = async () => {
            if (!hasSsoCookie()) return;

            // If the user already has a local session token, trust it and skip.
            // This prevents a redirect loop: after AuthPage creates a session and
            // redirects here, we must not immediately start another auth flow.
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

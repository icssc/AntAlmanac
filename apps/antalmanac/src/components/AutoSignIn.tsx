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

            const localSessionId = getLocalStorageSessionId();
            if (localSessionId) {
                const isValid = await trpc.auth.validateSession.query({ token: localSessionId });
                if (isValid) return;
            }

            const authUrl = await trpc.userData.getGoogleAuthUrl.query({ prompt: 'none' });
            window.location.href = authUrl.toString();
        };

        checkAndSignIn();
    }, []);

    return null;
}

import { loginUser } from '$actions/AppStoreActions';
import { authClient } from '$lib/auth/authClient';
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
    const { data, isPending } = authClient.useSession();

    useEffect(() => {
        if (hasChecked.current || isPending) {
            return;
        }
        hasChecked.current = true;

        const checkAndSignIn = async () => {
            if (!hasSsoCookie() || data?.session) {
                return;
            }

            loginUser({ silent: true });
        };

        checkAndSignIn();
    }, [isPending, data]);

    return null;
}

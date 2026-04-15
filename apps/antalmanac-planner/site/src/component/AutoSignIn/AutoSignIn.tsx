'use client';

import { useEffect, useRef } from 'react';
import { useIsLoggedIn } from '../../hooks/isLoggedIn';

/**
 * Automatically signs in users who have an existing ICSSC session.
 * This enables single sign-on across ICSSC apps (e.g., AntAlmanac, PeterPortal).
 *
 * How it works:
 * 1. Checks for icssc_logged_in cookie (set by any ICSSC app on antalmanac.com domain)
 * 2. If cookie exists, redirects to OAuth flow with prompt=none
 * 3. The auth server returns instantly if a session exists, or returns error=login_required
 */
export function AutoSignIn() {
    const isLoggedIn = useIsLoggedIn();
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current || isLoggedIn) return;
        hasChecked.current = true;

        if (!document.cookie.includes('icssc_logged_in=1')) return;

        // Redirect to OAuth flow with prompt=none for silent SSO
        window.location.href = '/api/planner/auth/google?prompt=none';
    }, [isLoggedIn]);

    return null;
}

export default AutoSignIn;

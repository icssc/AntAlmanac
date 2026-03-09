import { useEffect, useRef } from 'react';

import { loginUser } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId } from '$lib/localStorage';

const AUTH_ORIGIN = 'https://auth.icssc.club';
const SESSION_CHECK_TIMEOUT = 5000;

interface SessionCheckResult {
    valid: boolean;
    user: {
        id: string;
        email: string;
        name: string;
        picture?: string;
    } | null;
}

/**
 * Automatically signs in users who have an active session on auth.icssc.club.
 * This enables seamless SSO across ICSSC apps (AntAlmanac, PeterPortal, etc.)
 */
export function AutoSignIn() {
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) {
            return;
        }

        const checkAndSignIn = async () => {
            // Check if user already has a valid local session
            const localSessionId = getLocalStorageSessionId();
            if (localSessionId) {
                const isValid = await trpc.auth.validateSession.query({ token: localSessionId });
                if (isValid) {
                    // User is already authenticated locally
                    return;
                }
            }

            hasChecked.current = true;

            // Check if there's an active ICSSC session
            const result = await checkIcsscSession();
            if (result.valid) {
                // Auto-trigger OAuth flow - it will complete instantly since session exists
                loginUser();
            }
        };

        checkAndSignIn();
    }, []);

    return null;
}

function checkIcsscSession(): Promise<SessionCheckResult> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            cleanup();
            resolve({ valid: false, user: null });
        }, SESSION_CHECK_TIMEOUT);

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `${AUTH_ORIGIN}/session/check?origin=${encodeURIComponent(window.location.origin)}`;

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== AUTH_ORIGIN) return;
            if (event.data?.type !== 'icssc-session-check') return;

            cleanup();
            resolve({
                valid: event.data.valid,
                user: event.data.user,
            });
        };

        const cleanup = () => {
            clearTimeout(timeout);
            window.removeEventListener('message', handleMessage);
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        };

        window.addEventListener('message', handleMessage);
        document.body.appendChild(iframe);
    });
}

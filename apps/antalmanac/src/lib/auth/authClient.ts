import { genericOAuthClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import trpc from '$lib/api/trpc';
import type { auth } from '$src/lib/auth/auth';
import { useSessionStore } from '$stores/SessionStore';

export const authClient = createAuthClient({
    plugins: [genericOAuthClient(), inferAdditionalFields<typeof auth>()],
});

export type SessionData = typeof authClient.$Infer.Session;

export async function signOut(onLogoutComplete?: () => void) {
    const sessionId = useSessionStore.getState().sessionId;
    if (!sessionId) {
        await useSessionStore.getState().clearSession();
        onLogoutComplete?.();
        return;
    }

    const { error } = await authClient.signOut();

    if (error) {
        console.error('Error during logout', error);
    }

    await useSessionStore.getState().clearSession();
    onLogoutComplete?.();

    const { logoutUrl } = await trpc.userData.logout.mutate({
        sessionToken: sessionId,
        redirectUrl: window.location.origin,
    });

    window.location.href = logoutUrl;
}

import trpc from '$lib/api/trpc';
import type { auth } from '$src/lib/auth/auth';
import { useSessionStore } from '$stores/SessionStore';
import { genericOAuthClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    plugins: [genericOAuthClient(), inferAdditionalFields<typeof auth>()],
});

export type SessionData = typeof authClient.$Infer.Session;

export async function signOut(onLogoutComplete?: () => void) {
    const session = useSessionStore.getState().session;
    if (!session) {
        onLogoutComplete?.();
        await useSessionStore.getState().clearSession();
        return;
    }

    const { error } = await authClient.signOut();

    if (error) {
        console.error('Error during logout', error);
    }

    try {
        onLogoutComplete?.();
        await useSessionStore.getState().clearSession();

        const { logoutUrl } = await trpc.userData.getLogoutUrl.query({
            sessionToken: session.token,
            redirectUrl: window.location.origin,
        });

        window.location.href = logoutUrl;
    } catch (error) {
        console.error('Error during logout', error);
    }
}

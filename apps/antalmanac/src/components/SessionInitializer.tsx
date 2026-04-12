import { useEffect } from 'react';

import { authClient } from '$lib/auth/authClient';
import { useSessionStore } from '$stores/SessionStore';

const SessionInitializer = () => {
    const updateSession = useSessionStore((state) => state.updateSession);
    const { data: sessionData } = authClient.useSession();

    useEffect(() => {
        console.log(sessionData);
        if (sessionData) {
            if (sessionData.session.expiresAt < new Date()) {
                console.log('Session expired, logging out');
                authClient.signOut();
                return;
            }
            (async () => {
                await updateSession(sessionData);
            })();
        }
    }, [sessionData, updateSession]);

    return null;
};

export default SessionInitializer;

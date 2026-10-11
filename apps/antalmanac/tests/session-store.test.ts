import type { SessionData } from '$lib/auth/authClient';
import { getIsLoggedIn, useSessionStore } from '$stores/SessionStore';
import { describe, expect, test } from 'vitest';

describe('SessionStore', () => {
    test('getIsLoggedIn follows the session state', async () => {
        expect(getIsLoggedIn()).toBe(false);

        await useSessionStore.getState().updateSession({
            session: { id: 'session-id' },
            user: { id: 'user-id', email: 'test@uci.edu', name: 'Test', avatar: null },
        } as unknown as SessionData);

        expect(getIsLoggedIn()).toBe(true);
    });
});

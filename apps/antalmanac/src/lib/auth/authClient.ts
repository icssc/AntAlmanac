import { genericOAuthClient } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    plugins: [genericOAuthClient(), nextCookies()],
});

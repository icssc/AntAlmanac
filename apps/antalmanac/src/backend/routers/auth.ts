import { oidcOAuthEnvSchema } from '$src/backend/env';
import { RDS } from '$src/backend/lib/rds';
import { procedure, protectedProcedure, router } from '$src/backend/trpc';
import { db } from '@packages/db';
import { z } from 'zod';

const { OIDC_ISSUER_URL, BETTER_AUTH_URL } = oidcOAuthEnvSchema.parse(process.env);

const authRouter = router({
    getUserAndAccount: protectedProcedure.query(async ({ ctx }) => {
        return await RDS.getUserAndAccountBySessionToken(db, ctx.sessionToken);
    }),

    /**
     * Gets URL to invalidate user session on auth.icssc side
     */
    getLogoutUrl: procedure.input(z.object({ redirectUrl: z.string().optional() })).query(async ({ input }) => {
        const oidcLogoutUrl = new URL(`${OIDC_ISSUER_URL}/logout`);
        const redirectTo = input.redirectUrl || BETTER_AUTH_URL;
        oidcLogoutUrl.searchParams.set('post_logout_redirect_uri', redirectTo);
        return oidcLogoutUrl.toString();
    }),
});

export default authRouter;

import { middleware, procedure } from '$backend/trpc';
import { env } from '$src/env';
import { AAPIError, createClient } from '@packages/anteater-api/client';
import { TRPCError } from '@trpc/server';

export const aapiClient = createClient({ apiKey: env.ANTEATER_API_KEY });

const withAAPI = middleware(async ({ next }) => {
    try {
        return await next();
    } catch (e) {
        if (e instanceof AAPIError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message, cause: e });
        }
        throw e;
    }
});

export const aapiProcedure = procedure.use(withAAPI);

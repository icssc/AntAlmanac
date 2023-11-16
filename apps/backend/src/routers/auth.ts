import type { GoogleProfile } from '@auth/core/providers/google';

import { router, procedure } from '../trpc';

export const authRouter = router({
    login: procedure
        .input((rawInput) => rawInput as GoogleProfile)
        .mutation(async (opts) => {
            const user = opts.input;
            console.log({ user });
        }),
});

import type { Course } from '@packages/antalmanac-types';
import { z } from 'zod';
import { env } from 'src/env';
import { procedure, router } from '../trpc';

const { ANTEATER_API_KEY } = env;

const courseRouter = router({
    get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        return await fetch(`https://anteaterapi.com/v2/rest/courses/${encodeURIComponent(input.id)}`, {
            headers: {
                ...(ANTEATER_API_KEY && { Authorization: `Bearer ${ANTEATER_API_KEY}` }),
            },
        })
            .then((data) => data.json())
            .then((data) => (data.ok ? (data.data as Course) : null));
    }),
});

export default courseRouter;

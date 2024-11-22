import { z } from 'zod';
import { sanitizeSearchParams } from 'src/utils/utils';
import type { LarcAPIResponse } from '@packages/antalmanac-types';
import { procedure, router } from '../trpc';

const queryLarc = async ({ input }: { input: Record<string, string> }) =>
    await fetch(`https://anteaterapi.com/v2/rest/larc?${new URLSearchParams(sanitizeSearchParams(input))}`, {
        headers: {
            ...(process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
        },
    })
        .then((data) => data.json())
        .then((data) => data.data as LarcAPIResponse);

const larcRouter = router({
    getOne: procedure.input(z.record(z.string(), z.string())).query(queryLarc),
});

export default larcRouter;

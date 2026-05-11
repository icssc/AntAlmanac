import { aapiClient, aapiProcedure } from '$src/backend/lib/aapi';
import { z } from 'zod';

import { router } from '../trpc';

const courseRouter = router({
    get: aapiProcedure.input(z.object({ id: z.string() })).query(({ input }) => aapiClient.courses.get(input.id)),

    getMultiple: aapiProcedure
        .input(z.object({ courseIds: z.array(z.string()) }))
        .query(({ input }) => aapiClient.courses.getBatch(input.courseIds)),
});

export default courseRouter;

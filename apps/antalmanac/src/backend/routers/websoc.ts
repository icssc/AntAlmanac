import type { WebsocAPIResponse } from '@packages/antalmanac-types';
import { z } from 'zod';

import { combineWebsocResponses, getCourseInfo, queryWebSoc } from '../lib/websoc-service';
import { procedure, router } from '../trpc';

const websocRouter = router({
    getOne: procedure.input(z.record(z.string(), z.string())).query(({ input }) => queryWebSoc(input)),
    getMany: procedure
        .input(z.object({ params: z.record(z.string(), z.string()), fieldName: z.string() }))
        .query(async ({ input }) => {
            const responses: WebsocAPIResponse[] = [];
            for (const field of input.params[input.fieldName].trim().replace(' ', '').split(',')) {
                const req = JSON.parse(JSON.stringify(input.params)) as Record<string, string>;
                req[input.fieldName] = field;
                responses.push(await queryWebSoc(req));
            }
            return combineWebsocResponses(responses);
        }),
    getCourseInfo: procedure.input(z.record(z.string(), z.string())).query(({ input }) => getCourseInfo(input)),
});
export default websocRouter;

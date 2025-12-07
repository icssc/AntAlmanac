import { EnrollmentHistory } from '@packages/antalmanac-types';
import { z } from 'zod';

import { procedure, router } from '../trpc';

const enrollHistRouter = router({
    get: procedure.input(z.object({ department: z.string(), courseNumber: z.string(), sectionType: z.string() })).query(
        async ({ input }) =>
            await fetch(`https://anteaterapi.com/v2/rest/enrollmentHistory?${new URLSearchParams(input)}`, {
                headers: {
                    ...(process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}` }),
                },
            })
                .then((x) => x.json())
                .then((x) => x.data as EnrollmentHistory)
                .then((xs) => xs.filter((x) => x.dates.length)) // FIXME remove this shim once this is fixed on the API end
    ),
});

export default enrollHistRouter;

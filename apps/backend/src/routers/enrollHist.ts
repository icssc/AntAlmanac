import { EnrollmentHistory } from '@packages/antalmanac-types';
import {z} from "zod";
import {procedure, router} from "../trpc";

const enrollHistRouter = router({
    get: procedure
        .input(z.object({ department: z.string(), courseNumber: z.string(), sectionType: z.string() }))
        .query(async ({ input }) => await fetch(`https://anteaterapi.com/v2/rest/enrollmentHistory?${new URLSearchParams(input)}`).then(x => x.json()).then(x => x.data as EnrollmentHistory))
});

export default enrollHistRouter;

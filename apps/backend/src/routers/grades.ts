import type {AggregateGrades, AggregateGradesByOffering} from '@packages/antalmanac-types';
import {z} from "zod";
import {procedure, router} from "../trpc";

const gradesRouter = router({
    aggregateGrades: procedure
        .input(z.object({
            department: z.string().optional(),
            courseNumber: z.string().optional(),
            instructor: z.string().optional(),
            ge: z.string().optional()
        }))
        .query(async ({ input }) => await fetch(`https://anteaterapi.com/v2/rest/grades/aggregate?${new URLSearchParams(input)}`).then(x => x.json()).then(x => x.data as AggregateGrades)),
    aggregateByOffering: procedure
        .input(z.object({
            department: z.string().optional(),
            courseNumber: z.string().optional(),
            instructor: z.string().optional(),
            ge: z.string().optional()
        }))
        .query(async ({ input }) => await fetch(`https://anteaterapi.com/v2/rest/grades/aggregateByOffering?${new URLSearchParams(input)}`).then(x => x.json()).then(x => x.data as AggregateGradesByOffering))
});

export default gradesRouter;

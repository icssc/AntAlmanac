import type { AggregateGrades, AggregateGradesByOffering } from "@packages/antalmanac-types";
import { z } from "zod";

import { procedure, router } from "../trpc";

const gradesRouter = router({
    aggregateGrades: procedure
        .input(
            z.object({
                department: z.string().optional(),
                courseNumber: z.string().optional(),
                instructor: z.string().optional(),
                ge: z.string().optional(),
            }),
        )
        .query(
            async ({ input }) =>
                await fetch(
                    `https://anteaterapi.com/v2/rest/grades/aggregate?${new URLSearchParams(input)}`,
                    {
                        headers: {
                            ...(process.env.ANTEATER_API_KEY && {
                                Authorization: `Bearer ${process.env.ANTEATER_API_KEY}`,
                            }),
                        },
                    },
                )
                    .then((x) => x.json())
                    .then((x) => x.data as AggregateGrades),
        ),
    // This is a "mutation" because we don't want tRPC to batch it with the query for WebSoc data.
    aggregateByOffering: procedure
        .input(
            z
                .object({
                    department: z.string().optional(),
                    courseNumber: z.string().optional(),
                    instructor: z.string().optional(),
                    ge: z.string().optional(),
                })
                .transform(({ department, ge, ...rest }) => {
                    const dept = department?.toUpperCase();
                    return ge === undefined
                        ? { department: dept, ...rest }
                        : { department: dept, ge, ...rest };
                }),
        )
        .mutation(
            async ({ input }) =>
                await fetch(
                    `https://anteaterapi.com/v2/rest/grades/aggregateByOffering?${new URLSearchParams(
                        input as Record<string, string>,
                    )}`,
                    {
                        headers: {
                            ...(process.env.ANTEATER_API_KEY && {
                                Authorization: `Bearer ${process.env.ANTEATER_API_KEY}`,
                            }),
                        },
                    },
                )
                    .then((x) => x.json())
                    .then((x) => x.data as AggregateGradesByOffering),
        ),
});

export default gradesRouter;

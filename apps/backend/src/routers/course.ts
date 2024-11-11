import {z} from "zod";
import {procedure, router} from "../trpc";

const courseRouter = router({
    get: procedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const res = await fetch(`https://anteaterapi.com/v2/rest/courses/${encodeURIComponent(input.id)}`, {
                headers: {
                    ...process.env.ANTEATER_API_KEY && { Authorization: `Bearer ${process.env.ANTEATER_API_KEY}`}
                }
            }).then(data => data.json()).then(data => data.ok ? data.data as Course : null);
        })
});

export default courseRouter;

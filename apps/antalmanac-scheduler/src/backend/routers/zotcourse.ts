import { procedure, router } from '$backend/trpc';
import { z } from 'zod';

const zotcourseUrl = 'https://zotcourse.appspot.com/schedule/load';

const zotcourseRouter = router({
    getUserData: procedure.input(z.object({ scheduleName: z.string() })).mutation(async ({ input }) => {
        const url = new URL(zotcourseUrl);
        url.searchParams.append('username', input.scheduleName);
        const response = await fetch(url);
        return await response.json();
    }),
});

export default zotcourseRouter;

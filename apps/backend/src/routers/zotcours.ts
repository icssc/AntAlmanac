import { type } from 'arktype';
import { procedure, router } from '../trpc';

const zotcourseUrl = 'https://zotcourse.appspot.com/schedule/load';

const zotcourseRouter = router({
    getUserData: procedure.input(type({ scheduleName: 'string' }).assert).mutation(async ({ input }) => {
        const url = new URL(zotcourseUrl);
        url.searchParams.append('username', input.scheduleName);
        const response = await fetch(url);
        return await response.json();
    }),
});

export default zotcourseRouter;

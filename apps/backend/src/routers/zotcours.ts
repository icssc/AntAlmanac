import { procedure, router } from '../trpc';
import {type} from 'arktype';

const zotcourseUrl = 'https://zotcourse.appspot.com/schedule/load';

const zotcourseRouter = router({
    getUserData: procedure
        .input(type({ scheduleName: 'string' }).assert)
        .mutation(async ({ input }) => {
            let url = new URL(zotcourseUrl);
            url.searchParams.append('username', input.scheduleName);
            const response = await fetch(url);
            return await response.json();
        }),
});

export default zotcourseRouter;
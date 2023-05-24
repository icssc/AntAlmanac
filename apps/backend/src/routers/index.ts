import { router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';
import zotcourseRouter from './zotcours';

const appRouter = router({
    news: newsRouter,
    users: usersRouter,
    zotcourse: zotcourseRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

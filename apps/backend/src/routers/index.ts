import { router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';
import zotcourseRouter from './zotcours';
import authUsersRouter from './authusers';

const appRouter = router({
    news: newsRouter,
    users: usersRouter,
    authusers: authUsersRouter,
    zotcourse: zotcourseRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

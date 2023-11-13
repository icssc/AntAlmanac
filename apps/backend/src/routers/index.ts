import { router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';
import zotcourseRouter from "./zotcours";
import aantsRouter from './aants';

const appRouter = router({
    news: newsRouter,
    users: usersRouter,
    zotcourse: zotcourseRouter,
    aants: aantsRouter
});

export type AppRouter = typeof appRouter;
export default appRouter;

import { router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';
import zotcourseRouter from "./zotcours";
import courseRouter from "./course";

const appRouter = router({
    course: courseRouter,
    news: newsRouter,
    users: usersRouter,
    zotcourse: zotcourseRouter
});

export type AppRouter = typeof appRouter;
export default appRouter;

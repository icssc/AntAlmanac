import { router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';
import zotcourseRouter from "./zotcours";
import courseRouter from "./course";
import websocRouter from "./websoc";

const appRouter = router({
    course: courseRouter,
    news: newsRouter,
    users: usersRouter,
    websoc: websocRouter,
    zotcourse: zotcourseRouter
});

export type AppRouter = typeof appRouter;
export default appRouter;

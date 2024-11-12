import { router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';
import zotcourseRouter from './zotcours';
import courseRouter from './course';
import websocRouter from './websoc';
import gradesRouter from './grades';
import enrollHistRouter from './enrollHist';

const appRouter = router({
    course: courseRouter,
    enrollHist: enrollHistRouter,
    grades: gradesRouter,
    news: newsRouter,
    users: usersRouter,
    websoc: websocRouter,
    zotcourse: zotcourseRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

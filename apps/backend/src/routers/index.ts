import { router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';
import zotcourseRouter from './zotcours';
import courseRouter from './course';
import websocRouter from './websoc';
import gradesRouter from './grades';
import enrollHistRouter from './enrollHist';
import searchRouter from './search';
import larcRouter from './larc';

const appRouter = router({
    course: courseRouter,
    enrollHist: enrollHistRouter,
    grades: gradesRouter,
    larc: larcRouter,
    news: newsRouter,
    search: searchRouter,
    users: usersRouter,
    websoc: websocRouter,
    zotcourse: zotcourseRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

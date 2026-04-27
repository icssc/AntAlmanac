import { router } from '../trpc';
import courseRouter from './course';
import enrollHistRouter from './enrollHist';
import friendsRouter from './friends';
import gradesRouter from './grades';
import notificationsRouter from './notifications';
import roadmapRouter from './roadmap';
import searchRouter from './search';
import userDataRouter from './userData';
import websocRouter from './websoc';
import zotcourseRouter from './zotcourse';

const appRouter = router({
    course: courseRouter,
    enrollHist: enrollHistRouter,
    friends: friendsRouter,
    grades: gradesRouter,
    notifications: notificationsRouter,
    search: searchRouter,
    userData: userDataRouter,
    websoc: websocRouter,
    zotcourse: zotcourseRouter,
    roadmap: roadmapRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

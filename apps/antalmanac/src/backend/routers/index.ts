import { router } from '../trpc';
import authRouter from './auth';
import courseRouter from './course';
import enrollHistRouter from './enrollHist';
import friendsRouter from './friends';
import gradesRouter from './grades';
import notificationsRouter from './notifications';
import reviewRouter from './review';
import roadmapRouter from './roadmap';
import scheduleRouter from './schedule';
import searchRouter from './search';
import websocRouter from './websoc';
import zotcourseRouter from './zotcourse';

const appRouter = router({
    auth: authRouter,
    course: courseRouter,
    enrollHist: enrollHistRouter,
    friends: friendsRouter,
    grades: gradesRouter,
    notifications: notificationsRouter,
    review: reviewRouter,
    roadmap: roadmapRouter,
    schedule: scheduleRouter,
    search: searchRouter,
    websoc: websocRouter,
    zotcourse: zotcourseRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

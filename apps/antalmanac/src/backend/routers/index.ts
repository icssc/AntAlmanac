import { router } from '../trpc';
import courseRouter from './course';
import enrollHistRouter from './enrollHist';
import gradesRouter from './grades';
import notificationsRouter from './notifications';
import roadmapRouter from './roadmap';
import searchRouter from './search';
import syllabiRouter from './syllabi';
import userDataRouter from './userData';
import websocRouter from './websoc';
import zotcourseRouter from './zotcourse';

const appRouter = router({
    course: courseRouter,
    enrollHist: enrollHistRouter,
    grades: gradesRouter,
    notifications: notificationsRouter,
    search: searchRouter,
    syllabi: syllabiRouter,
    userData: userDataRouter,
    websoc: websocRouter,
    zotcourse: zotcourseRouter,
    roadmap: roadmapRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

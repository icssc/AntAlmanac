import courseRouter from '$backend/routers/course';
import enrollHistRouter from '$backend/routers/enrollHist';
import friendsRouter from '$backend/routers/friends';
import gradesRouter from '$backend/routers/grades';
import notificationsRouter from '$backend/routers/notifications';
import reviewRouter from '$backend/routers/review';
import roadmapRouter from '$backend/routers/roadmap';
import scheduleRouter from '$backend/routers/schedule';
import searchRouter from '$backend/routers/search';
import websocRouter from '$backend/routers/websoc';
import zotcourseRouter from '$backend/routers/zotcourse';
import { router } from '$backend/trpc';

const appRouter = router({
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

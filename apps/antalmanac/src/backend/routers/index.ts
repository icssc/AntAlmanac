import { router } from "../trpc";
import authRouter from "./auth";
import courseRouter from "./course";
import enrollHistRouter from "./enrollHist";
import gradesRouter from "./grades";
import notificationsRouter from "./notifications";
import searchRouter from "./search";
import userDataRouter from "./userData";
import websocRouter from "./websoc";
import zotcourseRouter from "./zotcourse";

const appRouter = router({
    course: courseRouter,
    enrollHist: enrollHistRouter,
    grades: gradesRouter,
    notifications: notificationsRouter,
    search: searchRouter,
    auth: authRouter,
    userData: userDataRouter,
    websoc: websocRouter,
    zotcourse: zotcourseRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

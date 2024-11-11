import { router } from '../trpc';
import usersRouter from './users';
import zotcourseRouter from "./zotcours";

const appRouter = router({
    users: usersRouter,
    zotcourse: zotcourseRouter
});

export type AppRouter = typeof appRouter;
export default appRouter;

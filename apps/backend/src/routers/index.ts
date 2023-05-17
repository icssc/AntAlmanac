import { router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';

const appRouter = router({
    news: newsRouter,
    users: usersRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

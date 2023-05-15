import { router, procedure } from '../trpc'
// import adRouter from './ad'
// import enrollmentRouter from './enrollment'
import newsRouter from './news'
// import notificationRouter from './notification'
import usersRouter from './users'
// import websocRouter from './websoc'

const appRouter = router({
    '': procedure.query(() => {
        return 'Welcome to tRPC. You can reach this link in dev via http://localhost:3000/trpc'
    }),
    // ad: adRouter,
    // enrollment: enrollmentRouter,
    news: newsRouter,
    users: usersRouter,
    // notification: notificationRouter,
    // websoc: websocRouter,
})

export type AppRouter = typeof appRouter
export default appRouter

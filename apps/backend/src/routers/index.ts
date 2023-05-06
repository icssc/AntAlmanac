import { router, procedure } from '../trpc'
// import adRouter from './ad'
// import enrollmentRouter from './enrollment'
import newsRouter from './news'
// import notificationRouter from './notification'
// import userRouter from './user'
// import websocRouter from './websoc'

const appRouter = router({
    '': procedure.query(() => {
        return 'Welcome to tRPC. You can reach this link in dev via http://localhost:3000/trpc'
    }),
    // ad: adRouter,
    // enrollment: enrollmentRouter,
    news: newsRouter,
    // notification: notificationRouter,
    // user: userRouter,
    // websoc: websocRouter,
})

export type AppRouter = typeof appRouter
export default appRouter

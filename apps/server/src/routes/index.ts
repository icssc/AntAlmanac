import { procedure, router } from '../trpc'
import newsRouter from './news'
import notificationsRouter from './notifications'
import scheduleRouter from './schedule'
import userRouter from './user'

export const appRouter = router({
  '': procedure.query(() => 'Hello, World!'),
  news: newsRouter,
  notifications: notificationsRouter,
  schedule: scheduleRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter

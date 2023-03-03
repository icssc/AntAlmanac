import { procedure, router } from '../trpc'
import newsRouter from './news'
import notificationsRouter from './notifications'

export const appRouter = router({
  '': procedure.query(() => 'Hello, World!'),
  news: newsRouter,
  notifications: notificationsRouter,
})

export type AppRouter = typeof appRouter

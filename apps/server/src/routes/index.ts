import { procedure, router } from '../trpc'
import newsRouter from './news'

export const appRouter = router({
  '': procedure.query(() => 'Hello, World!'),
  news: newsRouter,
})

export type AppRouter = typeof appRouter

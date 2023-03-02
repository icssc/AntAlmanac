import { procedure, router } from '../trpc'

export const appRouter = router({
  hello: procedure.query(() => 'world'),
})

export type AppRouter = typeof appRouter

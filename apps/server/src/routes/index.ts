import { procedure, router } from '../trpc'
import NewsModel from '$models/News'

export const appRouter = router({
  '': procedure.query(() => 'Hello, World'),
  hello: procedure.query(() => 'world'),
  news: procedure.query(async () => {
    const news = await NewsModel.get('1')
    return news
  })
})

export type AppRouter = typeof appRouter

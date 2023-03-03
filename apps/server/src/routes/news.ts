import { randomUUID } from 'crypto'
import { newsSchema } from '@packages/schemas/news'
import NewsModel from '$models/News'
import { procedure, router } from '../trpc'

const newsRouter = router({
  /**
   * get all news
   */
  findAll: procedure.query(async () => {
    const news = await NewsModel.scan().exec()
    return news
  }),

  /**
   * given news data, insert a new news entry
   */
  insert: procedure.input(newsSchema.optional()).mutation(async ({ input }) => {
    const news = await NewsModel.create({ 
      ...input,
      id: randomUUID(),
      date: new Date()
    })
    console.log({ news })
    return news
  }),

  /**
   * delete all news entries
   */
  deleteAll: procedure.mutation(async () => {
    const news = await NewsModel.scan().exec()
    news.forEach(async k => {
      k.delete()
    })
  })
})

export default newsRouter

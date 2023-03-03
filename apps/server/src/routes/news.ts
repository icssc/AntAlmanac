import { randomUUID } from 'crypto'
import { z } from 'zod'
import { newsSchema } from '@packages/schemas/news'
import NewsModel from '$models/News'
import { procedure, router } from '../trpc'

const newsRouter = router({
  /**
   * find all news starting from a provided date
   */
  findAll: procedure.input(z.date().optional()).query(async ({ input }) => {
    const news = await NewsModel.scan().exec()
    return news
      .filter(n => n.date > (input || 0))
      .sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? 1 : 0)
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

import { randomUUID } from 'crypto'
import { z } from 'zod'
import { newsSchema } from '@packages/schemas/news'
import NewsModel from '$models/News'
import { procedure, router } from '../trpc'

const querySchema = z.object({
  date: z.date().nullish(),
  cursor: z.any().nullish(),
})

const newsRouter = router({
  /**
   * find all news starting from a provided date
   */
  findAll: procedure.input(querySchema).query(async ({ input }) => {
    const news = await NewsModel.query('stable').eq('Elysia').sort('ascending').limit(3).startAt(input.cursor).exec()
    return {
      news,
      nextCursor: news.lastKey,
    }
  }),

  /**
   * given news data, insert a new news entry
   */
  insert: procedure.input(newsSchema.optional()).mutation(async ({ input }) => {
    const news = await NewsModel.create({
      ...input,
      id: randomUUID(),
    })
    return news
  }),

  /**
   * delete all news entries
   */
  deleteAll: procedure.mutation(async () => {
    const news = await NewsModel.scan().exec()
    news.forEach(async (k) => {
      k.delete()
    })
  }),
})

export default newsRouter

import { randomUUID } from 'crypto'
import { newsSchema } from '@packages/schemas/news'
import NewsModel from '$models/News'
import { procedure, router } from '../trpc'

const newsRouter = router({
  findAll: procedure.query(async () => {
    const news = await NewsModel.get('1')
    return news
  }),

  insert: procedure.input(newsSchema.optional()).mutation(async ({ input }) => {
    const news = await NewsModel.create({ 
      ...input,
      id: randomUUID(),
      date: new Date()
    })
    console.log({ news })
    return news
  }),

  deleteAll: procedure.mutation(async () => {
    const news = await NewsModel.scan().exec()
    news.forEach(async k => {
      k.delete()
    })
  })
})

export default newsRouter

import { z } from 'zod'

export const newsSchema = z.object({
  title: z.string(),
  body: z.string(),
})

export type newsData = z.TypeOf<typeof newsSchema>

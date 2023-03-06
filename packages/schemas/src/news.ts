import { z } from 'zod'

/**
 * form data to add a news item
 */
export const newsSchema = z.object({
  title: z.string(),
  body: z.string(),
})

export type newsData = z.TypeOf<typeof newsSchema>

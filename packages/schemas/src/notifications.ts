import { z } from 'zod'

export const notificationsSchema = z.object({
  course: z.string(),
  userId: z.string()
})

export type notificationsData = z.TypeOf<typeof notificationsSchema>

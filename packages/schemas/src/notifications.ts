import { z } from 'zod'

export const notificationsSchema = z.object({
  sectionCode: z.string(),
  courseTitle: z.string(),
  phoneNumber: z.string(),
})

export type notificationsData = z.TypeOf<typeof notificationsSchema>

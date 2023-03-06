import { z } from 'zod'

export const notificationsSchema = z.object({
  course: z.string(), // {year} {quarter} {sectionCode}
  userId: z.string()
})

export type notificationsData = z.TypeOf<typeof notificationsSchema>

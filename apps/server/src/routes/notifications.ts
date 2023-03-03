import { z } from 'zod'
import { notificationsSchema } from '@packages/schemas/notifications'
import NotificationModel from '$models/Notification'
import { procedure, router } from '../trpc'

const notificationsRouter = router({
  insert: procedure.input(notificationsSchema).mutation(async ({ input }) => {
    const updatePhoneNumbers: Partial<any> = { $ADD: { phoneNumbers: input.phoneNumber }  }
    const notification = await NotificationModel.update(
      { sectionCode: input.sectionCode, courseTitle: input.courseTitle },
      updatePhoneNumbers
    )
    return notification
  }),

  find: procedure.input(z.string()).query(async ({ input }) => {
  })
})

export default notificationsRouter

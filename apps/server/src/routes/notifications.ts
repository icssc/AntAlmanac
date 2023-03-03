import { z } from 'zod'
import { notificationsSchema } from '@packages/schemas/notifications'
import NotificationModel from '$models/Notification'
import { procedure, router } from '../trpc'

const notificationsRouter = router({
  insert: procedure.input(notificationsSchema).mutation(async ({ input }) => {
    // Dynamoose TypeScript doesn't support this statement natively atm
    const updatePhoneNumbers: Partial<any> = { $ADD: { phoneNumbers: input.phoneNumber }  }

    const notification = await NotificationModel.update(
      { sectionCode: input.sectionCode, courseTitle: input.courseTitle },
      updatePhoneNumbers
    )
    return notification
  }),

  find: procedure.input(z.string()).query(async ({ input }) => {
    try {
      const notifications = await NotificationModel.query().where('phoneNumbers').contains(input).exec()
      console.log({notifications})
      return notifications
    } catch (e) {
      console.log(e)
    }
  })
})

export default notificationsRouter

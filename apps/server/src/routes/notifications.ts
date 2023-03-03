import { z } from 'zod'
import { notificationsSchema } from '@packages/schemas/notifications'
import NotificationModel from '$models/Notification'
import { procedure, router } from '../trpc'

const notificationsRouter = router({
  /**
   * insert a new notification entry
   */
  insert: procedure.input(notificationsSchema).mutation(async ({ input }) => {
    const existing = await NotificationModel.get({
      sectionCode: input.sectionCode,
      courseTitle: input.courseTitle
    })

    // Dynamoose TypeScript doesn't support this statement natively atm
    const updatePhoneNumbers: Partial<any> = 
        { [existing ? '$ADD' : '$SET']: { phoneNumbers: [input.phoneNumber] } }

    const notification = await NotificationModel.update(
      { sectionCode: input.sectionCode, courseTitle: input.courseTitle },
      updatePhoneNumbers
    )
    return notification
  }),

  /**
   * find all notifications for a given phone number
   */
  find: procedure.input(z.string()).query(async ({ input }) => {
    const allNotifications = await NotificationModel.scan().exec()
    const notifications = allNotifications.filter(n => n.phoneNumbers.includes(input))
    return notifications
  })
})

export default notificationsRouter

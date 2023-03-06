import { z } from 'zod'
import { notificationsSchema } from '@packages/schemas/notifications'
import NotificationModel from '$models/Notification'
import { procedure, router } from '../trpc'
import UserModel from '$models/User'

const notificationsRouter = router({
  /**
   * insert a new notification entry
   */
  insert: procedure.input(notificationsSchema).mutation(async ({ input }) => {
    const existing = await NotificationModel.get({
      course: input.course,
    })

    // Dynamoose TypeScript doesn't support this statement natively atm
    const updateUserIds: Partial<any> = { [existing ? '$ADD' : '$SET']: { userIds: [input.userId] } }
    
    const notification = await NotificationModel.update({ course: input.course }, updateUserIds)

    const user = await UserModel.get({
      id: input.userId,
    })

    if (!user) {
      return null
    }

    const updateNotifications: Partial<any> = {
      [user.notifications ? '$ADD' : '$SET']: { notifications: [input.course] },
    }

    const updatedUser = await UserModel.update(
      {
        id: input.userId,
      },
      updateNotifications
    )

    return { notification, updatedUser }
  }),

  /**
   * find all notifications for a given user
   */
  find: procedure.input(z.string()).query(async ({ input }) => {
    const user = await UserModel.get({
      id: input
    })

  if (!user) {
    return null
  }

  return user.notifications
  }),
})

export default notificationsRouter

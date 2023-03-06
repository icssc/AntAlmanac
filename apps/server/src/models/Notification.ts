import dynamoose from 'dynamoose'
import type { Item } from 'dynamoose/dist/Item'

interface Notification extends Item {
  course: string // {year} {quarter} {sectionCode}
  userIds: string[]
}

const NotificationModel = dynamoose.model<Notification>('Notifications', {
  course: {
    type: String,
    hashKey: true,
  },
  userIds: {
    type: Array,
    schema: [String],
    default: [],
  },
})

export default NotificationModel

import dynamoose from 'dynamoose'
import type { Item } from 'dynamoose/dist/Item'

interface Notification extends Item {
  id: string
  sectionCode: string
  courseTitle: string
  phoneNumbers: string[]
}

const NotificationModel = dynamoose.model<Notification>("Notification", {
  id: String,
  sectionCode: String,
  courseTitle: String,
  phoneNumbers: [String],
});

export default NotificationModel

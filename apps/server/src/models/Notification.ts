import dynamoose from 'dynamoose'
import type { Item } from 'dynamoose/dist/Item'

interface Notification extends Item {
  sectionCode: string
  courseTitle: string
  phoneNumbers: string[]
}

const NotificationModel = dynamoose.model<Notification>("Notifications", {
  sectionCode: {
    type: String,
    hashKey: true,
  },
  courseTitle: {
    type: String,
    rangeKey: true
  },
  phoneNumbers: {
    type: Array,
    schema: [String]
  },
});

export default NotificationModel

/**
 * notes:
 * I had to set phoneNumbers to [String] to create the table,
 * then I had to change it to { type: Array, schema: [String] } to make sure it was an array?
 */

import dynamoose from 'dynamoose'
import type { Item } from 'dynamoose/dist/Item'
import type {ScheduleSaveState, ShortCourseSchedule} from '@packages/schemas/schedule'

interface User extends Item {
  id: string
  name: string
  email: string
  notifications: string[] // `{year} {quarter} {sectionCode}`
  scheduleIndex: number
  schedules: ShortCourseSchedule[]
}

const UserSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
  },
  name: String,
  email: String,
  notifications: [String],
  scheduleIndex: Number,
  schedules: [
    {
      type: Object,
      schema: {
        scheduleName: String,
        scheduleIndex: Number,
        courses: [
          {
            type: Object,
            schema: {
              color: String,
              term: String,
              sectionCode: String,
            },
          },
        ],
        customEvents: [
          {
            type: Object,
            schema: {
              customEventID: Number,
              title: String,
              start: String,
              end: String,
              days: [Boolean],
              color: String,
            },
          },
        ],
      }
    }
  ],
})

const UserModel = dynamoose.model<User>('User', UserSchema)

export default UserModel

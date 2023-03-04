import dynamoose from 'dynamoose'
import type { Item } from 'dynamoose/dist/Item'

interface News extends Item {
  id: string
  title: string
  body: string

  // automatically added by dynamoose timestamps
  createdAt: Date

  // stable partition
  stable: 'Elysia'
}

const NewsSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
  },
  stable: {
    type: String,
    default: 'Elysia',
    forceDefault: true,
    index: {
      type: 'global',
      rangeKey: 'createdAt',
    }
  },
  title: String,
  body: String,
}, {
  timestamps: true,
})

const NewsModel = dynamoose.model<News>("News", NewsSchema);

export default NewsModel

import dynamoose from 'dynamoose'
import type { Item } from 'dynamoose/dist/Item'

interface News extends Item {
  id: string
  title: string
  body: string
  date: Date
}

const NewsModel = dynamoose.model<News>("News", {
  id: String,
  title: String,
  body: String,
  date: Date,
});

export default NewsModel

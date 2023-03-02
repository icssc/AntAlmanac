import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument, GetCommand, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

const documentClient = DynamoDBDocument.from(new DynamoDBClient({ region: 'us-east-1', endpoint: 'http://localhost:8000' }))

import { z } from 'zod'

async function createMovies() {
  const results = await documentClient.send(
    new CreateTableCommand({
      TableName: 'Movies',
      KeySchema: [
        { AttributeName: 'year', KeyType: 'HASH' }, //Partition key
        { AttributeName: 'title', KeyType: 'RANGE' }, //Sort key
      ],
      AttributeDefinitions: [
        { AttributeName: 'year', AttributeType: 'N' },
        { AttributeName: 'title', AttributeType: 'S' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 100,
      },
    })
  )
  console.log(results)
}

async function deleteMovies() {
  const results = await documentClient.send(
    new DeleteTableCommand({
      TableName: 'Movies',
    })
  )
  console.log(results)
}

async function addMovies(title: string, plot: string) {
  const results = await documentClient.send(
    new PutCommand({
      TableName: 'Movies',
      Item: {
        year: 2015,
        title,
        info: {
          plot,
          rating: 6.942,
        },
      },
    })
  )
  console.log(results)
}

const S = z.object({
  year: z.coerce.number(),
  title: z.string(),
})

async function getMovies() {
  const results = await documentClient.send(
    new GetCommand({
      TableName: 'Movies',
      Key: {
        title: 'I love',
        year: 2015,
      },
    })
  )
  console.log(results)
}

async function queryMovies() {
  const results = await documentClient.send(
    new QueryCommand({
      TableName: 'Movies',
      KeyConditionExpression: '#yr = :yyyy',
      ExpressionAttributeNames: {
        '#yr': 'year',
      },
      ExpressionAttributeValues: {
        ':yyyy': 2015,
      },
    })
  )
  const parsed = results.Items?.map((item) => S.parse(item)) || []
  console.log({ parsed })
  return parsed
}

async function run() {
  try {
    // deleteMovies();
    createMovies();
    // addMovies('hello', 'world')
    // addMovies('I love', 'Elysia');
    // getMovies();
    // queryMovies();
  } catch (err) {
    console.error(err)
  }
}

run()

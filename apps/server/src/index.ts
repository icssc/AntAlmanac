import cors from 'cors'
import dynamoose from 'dynamoose'
import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './routes'
import { createContext } from './context'

dynamoose.aws.ddb.local('http://localhost:8000')

const port = 3000

async function run() {
  const app = express()

  app.use(cors({ credentials: true, origin: true }))

  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  )

  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`)
  })
}

run()

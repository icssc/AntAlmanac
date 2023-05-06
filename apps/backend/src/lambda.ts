import serverlessExpress from '@vendia/serverless-express'
import { start } from '.'
import type { Context, Handler } from 'aws-lambda'
import conectToMongoDB from '$db/mongodb'

let cachedHandler: Handler

export async function handler(event: any, context: Context, callback: any) {
    if (!cachedHandler) {
        await conectToMongoDB();
        const app = await start(process.env.STAGE === 'prod')
        cachedHandler = serverlessExpress({ app })
    }
    return cachedHandler(event, context, callback)
}

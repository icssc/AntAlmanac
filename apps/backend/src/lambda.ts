import serverlessExpress from '@vendia/serverless-express';
import type { Context, Handler } from 'aws-lambda';
import { start } from '.';
import connectToMongoDB from '$db/mongodb';
import env from './env';

let cachedHandler: Handler;

export async function handler(event: any, context: Context, callback: any) {
    if (!cachedHandler) {
        const app = await start(env.NODE_ENV === 'production');
        cachedHandler = serverlessExpress({ app });
    }
    await connectToMongoDB();
    return cachedHandler(event, context, callback);
}

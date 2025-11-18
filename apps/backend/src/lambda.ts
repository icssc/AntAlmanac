import serverlessExpress from '@vendia/serverless-express';
import type { Context, Handler } from 'aws-lambda';

import { start } from '.';

let cachedHandler: Handler;

export async function handler(event: any, context: Context, callback: any) {
    if (!cachedHandler) {
        // Always enable CORS in production and staging environments
        const app = await start(true);
        cachedHandler = serverlessExpress({ app });
    }
    return cachedHandler(event, context, callback);
}

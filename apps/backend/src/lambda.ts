import serverlessExpress from '@vendia/serverless-express';
import type { Context, Handler } from 'aws-lambda';

import { env } from 'src/env';
import { start } from '.';

let cachedHandler: Handler;

export async function handler(event: any, context: Context, callback: any) {
    const { NODE_ENV } = env;

    if (!cachedHandler) {
        const app = await start(NODE_ENV === 'production');
        cachedHandler = serverlessExpress({ app });
    }
    return cachedHandler(event, context, callback);
}

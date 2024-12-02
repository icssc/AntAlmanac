import serverlessExpress from '@vendia/serverless-express';
import type { Context, Handler } from 'aws-lambda';

import {backendEnvSchema} from './env';
import { start } from '.';

let cachedHandler: Handler;

export async function handler(event: any, context: Context, callback: any) {
    const env = backendEnvSchema.parse(process.env)
    if (!cachedHandler) {
        const app = await start(env.NODE_ENV === 'production');
        cachedHandler = serverlessExpress({ app });
    }
    return cachedHandler(event, context, callback);
}

/**
 * Why isn't the global crypto defined???
 */
import crypto from 'crypto';
(global as any).crypto = crypto;

import express from 'express';
import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import { createAuthMiddleware } from '@aponia/integrations-express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import connectToMongoDB from '$db/mongodb';
import AppRouter from './routers';
import { createContext } from './context';
import { auth } from './auth';
import env from './env';

const corsOptions: CorsOptions = {
    origin: ['https://antalmanac.com', 'https://www.antalmanac.com', 'https://icssc-projects.github.io/AntAlmanac'],
};

const PORT = 3000;

export async function start(corsEnabled = false) {
    await connectToMongoDB();

    const app = express();

    const corsSettings = corsEnabled ? corsOptions : {origin: true};

    app.use(cors({...corsSettings, credentials: true }));

    app.use(express.json());

    app.use(cookieParser());

    app.use(createAuthMiddleware(auth));

    app.use(async (req, _res, next) => {
        next();
    });

    app.use(
        '/trpc',
        createExpressMiddleware({
            router: AppRouter,
            createContext,
        })
    );

    if (env.STAGE === 'local') {
        app.listen(PORT, async () => {
            console.log(`🚀 Server listening at http://localhost:${PORT}`);
        });
    }

    return app;
}

export const app = start();

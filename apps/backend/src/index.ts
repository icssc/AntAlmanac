import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import AppRouter from './routers';
import createContext from './context';
import connectToMongoDB from '$db/mongodb';
import env from './env';

const corsOptions: CorsOptions = {
    origin: ['https://antalmanac.com', 'https://www.antalmanac.com', 'https://icssc-projects.github.io/AntAlmanac'],
};

export async function start(corsEnabled = false) {
    await connectToMongoDB();

    const app = express();
    app.use(cors(corsEnabled ? corsOptions : undefined));
    app.use(express.json());

    app.use(
        '/trpc',
        createExpressMiddleware({
            router: AppRouter,
            createContext,
        })
    );

    if (env.STAGE === 'dev') {
        app.listen(3000, async () => {
            console.log('Server listening at http://localhost:3000');
        });
    }

    return app;
}

export const app = start();

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import connectToMongoDB from '$db/mongodb';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import AppRouter from './routers';
import createContext from './context';

const corsOptions: CorsOptions = {
    origin: ['https://antalmanac.com', 'https://www.antalmanac.com', 'https://icssc-projects.github.io/AntAlmanac'],
};

export async function start(corsEnabled: boolean = false) {
    await connectToMongoDB();

    const app = express();
    app.use(cors(corsEnabled ? corsOptions : undefined));
    app.use(express.json())

    app.use(
        '/trpc',
        createExpressMiddleware({
            router: AppRouter,
            createContext,
        })
    );

    console.log(import.meta.env)
    if (import.meta.env.MODE === 'development') {
        app.listen(3000, async () => {
            // eslint-disable-next-line no-console
            console.log('Server listening at http://localhost:3000');
        });
    }

    return app;
}

export default start();

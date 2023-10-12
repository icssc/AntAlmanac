import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import AppRouter from './routers';
import createContext from './context';
import env from './env';
import connectToMongoDB from '$db/mongodb';

const corsOptions: CorsOptions = {
    origin: ['https://antalmanac.com', 'https://www.antalmanac.com', 'https://icssc-projects.github.io/AntAlmanac'],
};

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicGVkcmljIiwiYSI6ImNsZzE0bjk2ajB0NHEzanExZGFlbGpwazIifQ.l14rgv5vmu5wIMgOUUhUXw';

const MAPBOX_API_URL = 'https://api.mapbox.com';

const PORT = 3000;

export async function start(corsEnabled = false) {
    await connectToMongoDB();

    const app = express();
    app.use(cors(corsEnabled ? corsOptions : undefined));
    app.use(express.json());

    app.use('/mapbox/directions/*', async (req, res) => {
        const searchParams = new URLSearchParams(req.query as any);
        searchParams.set('access_token', MAPBOX_ACCESS_TOKEN);
        const url = `${MAPBOX_API_URL}/directions/v5/${req.params[0]}?${searchParams.toString()}`;
        const result = await fetch(url).then((res) => res.text());
        res.send(result);
    });

    app.use('/mapbox/tiles/*', async (req, res) => {
        console.log(req.params[0])
        const searchParams = new URLSearchParams(req.query as any);
        searchParams.set('access_token', MAPBOX_ACCESS_TOKEN);
        const url = `${MAPBOX_API_URL}/styles/v1/mapbox/streets-v11/tiles/${req.params[0]}?${searchParams.toString()}`;
        const result = await fetch(url).then((res) => res.blob());
        res.type(result.type)
        result.arrayBuffer().then((buf) => {
            res.send(Buffer.from(buf))
        });
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

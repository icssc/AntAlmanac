import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import AppRouter from './routers';
import createContext from './context';
import env from './env';
// import connectToMongoDB from '$db/mongodb';

const MAPBOX_API_URL = 'https://api.mapbox.com';

const PORT = 3000;

const origins = ['https://antalmanac.com', 'https://www.antalmanac.com', 'https://icssc-projects.github.io/AntAlmanac'];

export async function start(corsEnabled = false) {
    const corsOptions: CorsOptions = {
        credentials: true,
        origin: corsEnabled ? origins : true,
    };

    // await connectToMongoDB();
    const app = express();

    app.use(cors(corsOptions));

    app.use(express.json());

    app.use('/mapbox/directions/*', async (req, res) => {
        const searchParams = new URLSearchParams(req.query as any);
        searchParams.set('access_token', env.MAPBOX_ACCESS_TOKEN);
        const url = `${MAPBOX_API_URL}/directions/v5/${(req.params as any)[0]}?${searchParams.toString()}`;
        const result = await fetch(url).then((res) => res.text());
        res.send(result);
    });

    app.use('/mapbox/tiles/*', async (req, res) => {
        const searchParams = new URLSearchParams(req.query as any);
        searchParams.set('access_token', env.MAPBOX_ACCESS_TOKEN);
        const url = `${MAPBOX_API_URL}/styles/v1/mapbox/streets-v11/tiles/${
            (req.params as any)[0]
        }?${searchParams.toString()}`;
        const buffer = await fetch(url).then((res) => res.arrayBuffer());
        res.type('image/png');
        res.send(Buffer.from(buffer));
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

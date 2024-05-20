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

const MAPBOX_API_URL = 'https://api.mapbox.com';

const PORT = 3000;
import { createTransport } from 'nodemailer';
const email = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
    type: 'OAuth2',
    user: env.GOOGLE_EMAIL,
    clientId: env.GOOGLE_ID,
    clientSecret: env.GOOGLE_SECRET,
    refreshToken: env.GOOGLE_REFRESH_TOKEN,
    },
})

export async function start(corsEnabled = false) {
    // await connectToMongoDB();

    const app = express();
    app.use(cors({ origin: true }));
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
        const url = `${MAPBOX_API_URL}/styles/v1/mapbox/streets-v11/tiles/${(req.params as any)[0]}?${searchParams.toString()}`;
        const buffer = await fetch(url).then((res) => res.arrayBuffer());
        res.type('image/png')
        res.send(Buffer.from(buffer))
        // // res.header('Content-Security-Policy', "img-src 'self'"); // https://stackoverflow.com/questions/56386307/loading-of-a-resource-blocked-by-content-security-policy
        // // res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        // res.type('image/png')
        // res.send(result)
    });

    app.get('/email', async () => {
        console.log("SENDING EMAIL")
        const res = await email.sendMail({
            to: 'rayantighiouartca@gmail.com', // presumably input.userEmail or something
            subject: 'Reset Password',
            text: `Reset your password`,
        })
        console.log('rez', res);
    })
    
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

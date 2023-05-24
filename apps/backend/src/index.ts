/**
 * Why isn't the global crypto defined???
 */
global.crypto = require('crypto')

import express from 'express';
import cookieParser from 'cookie-parser';
import cors, { type CorsOptions } from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import connectToMongoDB from '$db/mongodb';
import AppRouter from './routers';
import createContext from './context';
import env from './env';

import { createAuthMiddleware } from '@aponia/integrations-express'
import { auth } from './auth'

const corsOptions: CorsOptions = {
  origin: [
    'https://antalmanac.com',
    'https://www.antalmanac.com',
    'https://icssc-projects.github.io/AntAlmanac'
  ],
};

const { authMiddleware, getUser } = createAuthMiddleware(auth)

export async function start(corsEnabled = false) {
  await connectToMongoDB();

  const app = express();

  app.use(cors(corsEnabled ? corsOptions : undefined));

  app.use(express.json());

  app.use(cookieParser())

  app.use(authMiddleware)

  app.use((req, _res, next) => {
    (req as any).getUser = () => getUser(req)
    next()
  })

  app.use(async (req, _res, next) => {
    console.log(await (req as any).getUser())
    next()
  })

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

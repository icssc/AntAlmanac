import express from 'express';
import cookie from 'cookie'
import cors, { type CorsOptions } from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import AppRouter from './routers';
import createContext from './context';
import connectToMongoDB from '$db/mongodb';
import env from './env';

import { createAuthHelpers } from '@aponia/integrations-express'
import { AponiaAuth, AponiaSession } from 'aponia'
import { Google } from '@aponia/providers'

/**
 * Why isn't the global crypto defined???
 */
global.crypto = require('crypto')

const google = Google({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  onAuth(user, context) {
    return { user }
  },
})

const session = AponiaSession({
  secret: 'secret',
  createSession(user) {
    return { user, accessToken: user, refreshToken: user }
  },
})

const auth = AponiaAuth({
  session,
  providers: [google]
})

// const authMiddleware = createAuthHelpers(auth)

const corsOptions: CorsOptions = {
  origin: ['https://antalmanac.com', 'https://www.antalmanac.com', 'https://icssc-projects.github.io/AntAlmanac'],
};

export async function start(corsEnabled = false) {
  await connectToMongoDB();

  const app = express();

  app.use(cors(corsEnabled ? corsOptions : undefined));

  app.use(express.json());

  // app.use(authMiddleware)

  app.use(async (req, res, next) => {
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    const request = new Request(url, {
      method: req.method,
      headers: Object.entries(req.headers).map(([key, value]) =>
        [key.toLowerCase(), Array.isArray(value) ? value.join(', ') : (value ?? '')] as [string, string]
      ),
      ...(req.method !== 'GET' && req.method !== 'HEAD' && { body: req.body }),
    })

    const cookies = cookie.parse(req.headers.cookie ?? '')

    const internalRequest = { request, url, cookies }

    const internalResponse = await auth.handle(internalRequest)

    if (internalResponse.cookies?.length) {
      internalResponse.cookies.forEach(cookie => {
        if (cookie.options?.maxAge) {
          cookie.options.maxAge *= 1000
        }
        res.cookie(cookie.name, cookie.value, cookie.options)
      })
    }

    (req as any).user = () => session.getUserFromRequest(internalRequest)

    if (internalResponse.redirect && internalResponse.status) {
      res.redirect(internalResponse.status, internalResponse.redirect)
    }
    
    if (internalResponse.body) {
      res.json(internalResponse.body)
    }

    next()
  })

  app.use(async (req, res, next) => {
    console.log(await (req as any).user())
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

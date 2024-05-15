import { type } from 'arktype';
import jwt from 'jsonwebtoken';
import { ddbClient } from '../db/ddb';
import { procedure, router } from '../trpc';
import newsRouter from './news';
import usersRouter from './users';
import zotcourseRouter from './zotcours';

export interface GoogleProfile extends Record<string, any> {
    aud: string;
    azp: string;
    email: string;
    email_verified: boolean;
    exp: number;
    family_name?: string;
    given_name: string;
    hd?: string;
    iat: number;
    iss: string;
    jti?: string;
    locale?: string;
    name: string;
    nbf?: number;
    picture: string;
    sub: string;
}

const privateKey = 'secret';

const authRouter = router({
    status: procedure.query(async (context) => {
        const authCookie = context.ctx.req.cookies['auth'];

        if (authCookie == null) return;

        try {
            const authUser = jwt.decode(authCookie);
            return authUser;
        } catch (e) {
            console.error('Failed to decode auth cookie: ', e);
            return;
        }
    }),
    loginGoogle: procedure.input(type('string').assert).mutation(async (context) => {
        try {
            const idToken = jwt.decode(context.input) as GoogleProfile;

            // Set the auth cookie so the client can be recognized on future requests.
            const authCookie = jwt.sign({ googleId: context.input }, privateKey);

            context.ctx.res.cookie('auth', authCookie);

            return await ddbClient.getGoogleUserData(idToken.sub);
        } catch {
            return;
        }
    }),
    loginUsername: procedure.input(type('string').assert).mutation(async (context) => {
        const authCookie = jwt.sign({ username: context.input }, privateKey);

        // Set the auth cookie so the client can be recognized on future requests.
        context.ctx.res.cookie('auth', authCookie, { maxAge: 1000 * 60 * 60, path: '/' });

        return (await ddbClient.getUserData(context.input)) ?? (await ddbClient.getLegacyUserData(context.input));
    }),
});

const appRouter = router({
    auth: authRouter,
    news: newsRouter,
    users: usersRouter,
    zotcourse: zotcourseRouter,
});

export type AppRouter = typeof appRouter;
export default appRouter;

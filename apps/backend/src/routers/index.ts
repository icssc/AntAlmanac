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

export const AccessTokenSchema = type({
    id: 'string',
    googleId: 'string',
});

const privateKey = 'secret';

const authRouter = router({
    status: procedure.query(async (context) => {
        const authCookie = context.ctx.req.cookies['auth'];

        if (authCookie == null) return null;

        try {
            const decodedToken = jwt.decode(authCookie);

            const parsedToken = AccessTokenSchema(decodedToken);

            if (parsedToken.problems) {
                return null;
            }

            return parsedToken.data;
        } catch (e) {
            console.error('Failed to decode auth cookie: ', e);
            return null;
        }
    }),
    /**
     * Logs in with Google and returns schedule data.
     */
    loginGoogle: procedure.input(type('string').assert).mutation(async (context) => {
        try {
            const idToken = jwt.decode(context.input) as GoogleProfile;

            const googleId = idToken.sub;

            const existingUser = await ddbClient.get('googleId', googleId);

            if (existingUser != null) {
                const authCookie = jwt.sign(
                    {
                        id: existingUser.id,
                        googleId,
                    },
                    privateKey
                );

                // Set the auth cookie so the client can be recognized on future requests.
                context.ctx.res.cookie('auth', authCookie);

                return existingUser.userData;
            }

            await ddbClient.documentClient.put({
                TableName: ddbClient.tableName,
                Item: {
                    id: googleId,
                    googleId,
                },
            });

            /**
             * By default, a new user logged in with Google will just have their ID set to
             * their google ID.
             */
            const authCookie = jwt.sign(
                {
                    id: googleId,
                    googleId,
                },
                privateKey
            );

            context.ctx.res.cookie('auth', authCookie);

            return null;
        } catch (e) {
            console.error('Error ocurred while logging in with google: ', e);
            return null;
        }
    }),
    loginUsername: procedure.input(type('string').assert).mutation(async (context) => {
        const id = context.input;

        const userData = await ddbClient.getUserData(id);

        if (userData != null) {
            const authCookie = jwt.sign({ id }, privateKey);

            // Set the auth cookie so the client can be recognized on future requests.
            context.ctx.res.cookie('auth', authCookie, { maxAge: 1000 * 60 * 60, path: '/' });

            return userData;
        }

        await ddbClient.documentClient.put({
            TableName: ddbClient.tableName,
            Item: {
                id,
            },
        });
        const authCookie = jwt.sign({ id }, privateKey);

        // Set the auth cookie so the client can be recognized on future requests.
        context.ctx.res.cookie('auth', authCookie, { maxAge: 1000 * 60 * 60, path: '/' });

        return null;
    }),
    logout: procedure.mutation(async (context) => {
        context.ctx.res.cookie('auth', '', { maxAge: 0 });
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

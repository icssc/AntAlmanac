import jwt from 'jsonwebtoken';
import { AponiaAuth, AponiaSession } from 'aponia';
import { Google } from '@aponia/providers';
import env from './env';

type User = {
    type: 'Google' | 'Legacy'
    id: string
}

type Session = User

type Refresh = User

const google = Google<User>({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,

    async onAuth(user) {
        console.log('ON AUTH');
        return {
            user: { type: 'Google', id: user.sub },
            redirect: '/',
            status: 302
        };
    },
});

const newExpires = () => 60 * 60 * 24 * 7; // 1 week

const session = AponiaSession<User, Session, Refresh>({
    secret: 'secret',

    async createSession(user) {
        // i.e. create a new session in the database, randomly generate a refresh token, etc.
        console.log('CREATE SESSION');
        const expires = newExpires();
        const token = { ...user, expires}
        return { user, accessToken: token, refreshToken: token };
    },

    handleRefresh(tokens) {
        console.log('HANDLE REFRESH');
        console.log(tokens);
        if (tokens.refreshToken === undefined) {
            return undefined;
        }

        const expires = newExpires();
        const newToken = { ...tokens.refreshToken, expires };

        return {
            user: newToken,
            accessToken: newToken,
            refreshToken: newToken
        };
    },
});

export const auth = AponiaAuth({
    session,
    providers: [google],
});

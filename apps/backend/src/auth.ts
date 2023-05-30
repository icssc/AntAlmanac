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
        return {
            user: { type: 'Google', id: user.sub },
            redirect: '/',
            status: 302
        };
    },
});

const refreshExpires = 60 * 60 * 24 * 7 * 4; // 4 week
const accessExpires = 60 * 60 * 24 * 7; // 1 week

const session = AponiaSession<User, Session, Refresh>({
    secret: 'secret',

    async createSession(user) {
        // i.e. create a new session in the database, randomly generate a refresh token, etc.
        console.log('CREATE SESSION');
        const accessToken = {...user, expires: accessExpires}
        const refreshToken = {...user, expires: refreshExpires}
        return { user, accessToken: accessToken, refreshToken: refreshToken };
    },

    handleRefresh(tokens) {
        console.log('HANDLE REFRESH')
        const accessToken = {...tokens.refreshToken, expires: accessExpires}
        const refreshToken = {...tokens.refreshToken, expires: refreshExpires}
        return {
            user: refreshToken,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
    },
});

export const auth = AponiaAuth({
    session,
    providers: [google],
});

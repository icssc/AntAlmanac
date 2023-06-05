import { AponiaAuth, AponiaSession } from 'aponia';
import { Google } from '@aponia/providers';
import env from './env';
import {AuthUserClient} from "$db/ddb";

type User = {
    type: 'Google' | 'Legacy';
    id: string,
    email: string,
    name: string,
    picture: string
};

type Session = User;

type Refresh = User;

const google = Google<User>({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,

    async onAuth(user) {
        if (await AuthUserClient.get(user.sub) === undefined) {
            await AuthUserClient.insertItem({
                id: user.sub,
                userData: {
                    schedules: [{ scheduleName: 'Schedule 1', courses: [], customEvents: [], scheduleNote: ''}],
                    scheduleIndex: 0,
                },
                name: user.name,
                email: user.email,
                picture: user.picture,
            });
        }
        return {
            user: { type: 'Google', id: user.sub, name: user.name, email: user.email, picture: user.picture },
            redirect: 'http://localhost:5173',
            status: 302,
        };
    },
});

const refreshExpires = 60 * 60 * 24 * 7 * 4; // 4 weeks
const accessExpires = 60 * 60 * 24 * 7; // 1 week

const session = AponiaSession<User, Session, Refresh>({
    secret: 'secret',

    async createSession(user) {
        // i.e. create a new session in the database, randomly generate a refresh token, etc.
        const accessToken = { ...user, expires: accessExpires };
        const refreshToken = { ...user, expires: refreshExpires };
        return { user, accessToken: accessToken, refreshToken: refreshToken };
    },

    handleRefresh(tokens) {
        const accessToken = { ...tokens.refreshToken, expires: accessExpires };
        const refreshToken = { ...tokens.refreshToken, expires: refreshExpires };
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

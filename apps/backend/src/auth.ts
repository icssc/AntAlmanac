import { AponiaAuth } from 'aponia';
import { AponiaSession } from 'aponia/session'
import { Google } from 'aponia/providers/google';
import env from './env';
import {AuthUserClient} from "$db/ddb";

const getRedirectUrl = () => {
    if (env.STAGE === 'local') {
        return 'http://localhost:5173';
    } else if (env.STAGE === 'staging') {
        return 'https://staging-654.antalmanac.com/';
    } else {
        return 'https://antalmanac.com';
    }
}

type User = {
    type: 'Google' | 'Legacy';
    id: string,
    email: string,
    name: string,
    picture: string
};

const google = Google({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,

    async onAuth(user) {
        if (await AuthUserClient.get(user.sub) === undefined) {
            await AuthUserClient.insertItem({
                id: user.sub,
                userData: {
                    schedules: [{ scheduleName: 'Schedule 1', courses: [], customEvents: [], scheduleNote: '', favorite: false}],
                    scheduleIndex: 0,
                },
                name: user.name,
                email: user.email,
                picture: user.picture,
            });
        }
        return {
            user: { type: 'Google', id: user.sub, name: user.name, email: user.email, picture: user.picture },
            redirect: getRedirectUrl(),
            status: 302,
        };
    },
});

const refreshExpires = 60 * 60 * 24 * 7 * 4; // 4 weeks
const accessExpires = 60 * 60 * 24 * 7; // 1 week

const session = AponiaSession({
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

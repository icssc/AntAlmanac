import { AponiaAuth, AponiaSession } from 'aponia';
import { Google } from '@aponia/providers';
import env from './env';

const google = Google({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    async onAuth(user) {
        return { user };
    },
});

const session = AponiaSession({
    secret: 'secret',
    async createSession(user) {
        return { user, accessToken: user, refreshToken: user };
    },
});

export const auth = AponiaAuth({
    session,
    providers: [google],
});

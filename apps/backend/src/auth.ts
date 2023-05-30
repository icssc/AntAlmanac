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

const session = AponiaSession<User, Session, Refresh>({
  secret: 'secret',

  async createSession(user) {
    return { user, accessToken: user, refreshToken: user };
  },

  handleRefresh(tokens) {
    return { 
      user: tokens.refreshToken,
      accessToken: tokens.refreshToken,
      refreshToken: tokens.refreshToken,
    };
  },
});

export const auth = AponiaAuth({
  session,
  providers: [google],
});

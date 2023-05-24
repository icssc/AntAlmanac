import { AponiaAuth, AponiaSession } from 'aponia';
import { Google } from '@aponia/providers';
import env from './env';

const google = Google({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,

  /**
   * Describe what to do after user has been authenticated with Google OAuth.
   * Return a `user` object that will be passed to `session.createSession` to login the user.
   */
  async onAuth(user) {
    // i.e. add the user to the database, assign them schedules, 
    // return a modified user object with only the necessary information for the accessToken.
    return { user, redirect: '/', status: 302 };
  },
});

const session = AponiaSession({
  secret: 'secret',

  /**
   * Describe how to create a new session. 
   * - user: identifies the user for the current request.
   * - accessToken: used to identify user on subsequent requests, will automatically be encoded into a cookie.
   * - refreshToken: used to refresh the accessToken, will automatically be encoded into a cookie.
   */
  async createSession(user) {
    // i.e. create a new session in the database, randomly generate a refresh token, etc.
    return { user, accessToken: user, refreshToken: user };
  },

  /**
   * Describe how to refresh a session with the provided tokens.
   */
  handleRefresh(tokens) {
  },

  /**
   * Describe what to do when a user logs out. 
   * By default, the tokens are removed, but additional steps may need to be taken in the database.
   */
  onInvalidateSession(session, refresh, context) {
  },
});

export const auth = AponiaAuth({
  session,
  providers: [google],
});

import { OAuth2Client } from 'arctic';
import { env } from 'src/env';

const { OIDC_CLIENT_ID, GOOGLE_OAUTH_REDIRECT_URI } = env;

export const oauth = new OAuth2Client(OIDC_CLIENT_ID, null, GOOGLE_OAUTH_REDIRECT_URI);

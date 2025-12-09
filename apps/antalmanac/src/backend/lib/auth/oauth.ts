import { OAuth2Client } from 'arctic';

import { oidcOAuthEnvSchema } from '$src/backend/env';

const { OIDC_CLIENT_ID, GOOGLE_OAUTH_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);

export const oauth = new OAuth2Client(OIDC_CLIENT_ID, null, GOOGLE_OAUTH_REDIRECT_URI);

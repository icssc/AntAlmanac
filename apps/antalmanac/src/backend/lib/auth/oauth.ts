import { oidcOAuthEnvSchema } from "$src/backend/env";
import { OAuth2Client } from "arctic";

const { OIDC_CLIENT_ID, GOOGLE_REDIRECT_URI } = oidcOAuthEnvSchema.parse(process.env);

export const oauth = new OAuth2Client(OIDC_CLIENT_ID, null, GOOGLE_REDIRECT_URI);

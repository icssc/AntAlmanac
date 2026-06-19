import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    /**
     * URL to return to when finish authentication
     */
    returnTo: string;
    /**
     * Internal user ID
     */
    userId: number;
    /**
     * User's display name
     */
    userName: string;
    /**
     * Whether the user is an admin
     */
    isAdmin: boolean;
    /**
     * OAuth state for CSRF protection
     */
    oauthState?: string;
    /**
     * PKCE code verifier for OAuth flow
     */
    codeVerifier?: string;
    /**
     * redirect_uri used in the /authorize request; must match on the token
     * exchange. Persisted so the native iOS flow (which uses a dedicated
     * `/callback/native` URI) exchanges against the same URI it advertised.
     */
    oauthRedirectUri?: string;
  }
}

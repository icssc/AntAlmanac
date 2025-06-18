import { URL } from 'url';
import { OAuth2Client } from 'google-auth-library';
import { backendEnvSchema } from 'src/env';
import { TRPCError } from '@trpc/server';

/**
 * Manages Google OAuth2 clients for different redirect origins.
 * Handles client creation and validation of redirect URIs based on environment.
 */
export class GoogleOAuth2ClientsManager {
    /**
     * Map of redirect origins to OAuth2Clients.
     */
    private clients: Map<string, OAuth2Client> = new Map();
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly allowDynamicRedirects: boolean;
    private readonly redirectOrigin: string;

    constructor(_clientId: string, _clientSecret: string) {
        this.clientId = _clientId;
        this.clientSecret = _clientSecret;

        const { STAGE, GOOGLE_REDIRECT_URI } = backendEnvSchema.parse(process.env);
        this.allowDynamicRedirects = STAGE !== 'prod';
        this.redirectOrigin = GOOGLE_REDIRECT_URI;
    }

    /**
     * Gets or creates an OAuth2Client for the given redirect origin.
     *
     * @param redirectOrigin - The origin URL to create/get a client for
     * @returns OAuth2Client configured for the given redirect origin
     */
    getClient(redirectOrigin: string): OAuth2Client {
        // If the STAGE is prod then we will use the value stored from GOOGLE_REDIRECT_URI (i.e. https://antalmanac.com/auth)
        if (!this.allowDynamicRedirects && redirectOrigin !== this.redirectOrigin) {
            return new OAuth2Client(this.clientId, this.clientSecret, this.redirectOrigin);
        }

        try {
            const client = this.clients.get(redirectOrigin);
            if (!client) {
                throw new Error('Client not found');
            }
            return client;
        } catch (error) {
            const urlParsed = new URL(redirectOrigin);
            const hasNoPath = urlParsed.pathname === '/';
            const isLocalhost = urlParsed.hostname === 'localhost' || urlParsed.hostname === '127.0.0.1';
            const isAntAlmanac = urlParsed.hostname.endsWith('antalmanac.com');

            const isValidRedirectUri = (isLocalhost || isAntAlmanac) && hasNoPath;

            if (!this.clients.has(redirectOrigin) && isValidRedirectUri) {
                const client = new OAuth2Client(this.clientId, this.clientSecret, redirectOrigin + '/auth');
                this.clients.set(redirectOrigin, client);
                return client;
            } else {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid redirect origin ' + redirectOrigin,
                });
            }
        }
    }
}

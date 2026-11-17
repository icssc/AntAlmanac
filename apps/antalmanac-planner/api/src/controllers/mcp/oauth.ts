/**
 * Fetch-API (Next.js route handler) implementations of the OAuth 2.1 authorization-server
 * endpoints used by MCP clients: authorize, token, register (RFC 7591), revoke (RFC 7009),
 * and the discovery documents (RFC 8414 / RFC 9728).
 *
 * The MCP SDK ships these as Express routers only, so they are reimplemented here with the
 * same validation: registered redirect URIs, PKCE S256, client authentication, single-use
 * authorization codes. Persisted state lives in {@link ./provider}.
 * @module
 */

import { createHash, timingSafeEqual } from 'node:crypto';

import {
    OAuthClientMetadataSchema,
    type OAuthClientInformationFull,
    type OAuthMetadata,
    type OAuthProtectedResourceMetadata,
} from '@modelcontextprotocol/sdk/shared/auth.js';

import { MCP_SCOPES, generateSecret, getMcpBaseUrl } from './config';
import {
    authorize,
    buildRedirect,
    clientsStore,
    exchangeAuthorizationCode,
    exchangeRefreshToken,
    getAuthorizationCode,
    redirect,
    revokeToken,
} from './provider';

export const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Mcp-Session-Id, Mcp-Protocol-Version',
    'Access-Control-Expose-Headers': 'Mcp-Session-Id, WWW-Authenticate',
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS, ...headers },
    });
}

function oauthError(error: string, description: string, status = 400): Response {
    return json({ error, error_description: description }, status);
}

/** Read a form-encoded (or JSON) request body as a flat string map. */
async function readParams(request: Request): Promise<Record<string, string>> {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
        return Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v)]));
    }
    const text = await request.text();
    return Object.fromEntries(new URLSearchParams(text));
}

function safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Authenticate the client on token/revoke requests (`client_secret_post`, or `client_secret_basic`,
 * or a public client with `none`). Returns the client or an error response.
 */
async function authenticateClient(
    request: Request,
    params: Record<string, string>
): Promise<OAuthClientInformationFull | Response> {
    let clientId = params.client_id;
    let clientSecret = params.client_secret;

    const authorization = request.headers.get('authorization');
    if (authorization?.startsWith('Basic ')) {
        const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
        const sep = decoded.indexOf(':');
        clientId = decodeURIComponent(decoded.slice(0, sep));
        clientSecret = decodeURIComponent(decoded.slice(sep + 1));
    }

    if (!clientId) return oauthError('invalid_client', 'client_id is required', 401);
    const client = await clientsStore.getClient(clientId);
    if (!client) return oauthError('invalid_client', 'Unknown client', 401);

    if (client.client_secret) {
        if (!clientSecret || !safeEqual(client.client_secret, clientSecret)) {
            return oauthError('invalid_client', 'Invalid client_secret', 401);
        }
        if (client.client_secret_expires_at && client.client_secret_expires_at < Math.floor(Date.now() / 1000)) {
            return oauthError('invalid_client', 'Client secret has expired', 401);
        }
    }
    return client;
}

export function buildMetadata(request: Request): {
    oauthMetadata: OAuthMetadata;
    protectedResourceMetadata: OAuthProtectedResourceMetadata;
} {
    const base = getMcpBaseUrl(request);
    const oauthMetadata: OAuthMetadata = {
        issuer: base,
        authorization_endpoint: `${base}/authorize`,
        token_endpoint: `${base}/token`,
        registration_endpoint: `${base}/register`,
        revocation_endpoint: `${base}/revoke`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        code_challenge_methods_supported: ['S256'],
        token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'],
        revocation_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic', 'none'],
        scopes_supported: MCP_SCOPES,
    };
    const protectedResourceMetadata: OAuthProtectedResourceMetadata = {
        resource: base,
        authorization_servers: [base],
        scopes_supported: MCP_SCOPES,
        resource_name: 'AntAlmanac Planner',
    };
    return { oauthMetadata, protectedResourceMetadata };
}

/** `GET|POST /authorize` */
export async function handleAuthorize(request: Request): Promise<Response> {
    const params =
        request.method === 'POST' ? await readParams(request) : Object.fromEntries(new URL(request.url).searchParams);

    // Errors before the redirect URI is validated must not redirect (RFC 6749 §4.1.2.1).
    if (!params.client_id) return oauthError('invalid_request', 'client_id is required');
    const client = await clientsStore.getClient(params.client_id);
    if (!client) return oauthError('invalid_client', 'Unknown client');

    let redirectUri = params.redirect_uri;
    if (redirectUri) {
        if (!client.redirect_uris.includes(redirectUri)) {
            return oauthError('invalid_request', 'Unregistered redirect_uri');
        }
    } else if (client.redirect_uris.length === 1) {
        redirectUri = client.redirect_uris[0];
    } else {
        return oauthError('invalid_request', 'redirect_uri must be specified when the client has several');
    }

    const fail = (error: string, description: string) =>
        redirect(
            buildRedirect(redirectUri, {
                error,
                error_description: description,
                ...(params.state ? { state: params.state } : {}),
            })
        );

    if (params.response_type !== 'code') return fail('unsupported_response_type', 'response_type must be "code"');
    if (!params.code_challenge) return fail('invalid_request', 'code_challenge is required');
    if (params.code_challenge_method !== 'S256') return fail('invalid_request', 'code_challenge_method must be S256');

    const scopes = params.scope ? params.scope.split(' ').filter(Boolean) : undefined;
    if (scopes?.some((s) => !MCP_SCOPES.includes(s))) {
        return fail('invalid_scope', `Supported scopes: ${MCP_SCOPES.join(' ')}`);
    }

    try {
        return await authorize(
            client,
            { redirectUri, codeChallenge: params.code_challenge, scopes, state: params.state },
            request
        );
    } catch (error) {
        console.error('MCP authorize error:', error);
        return fail('server_error', 'Internal server error');
    }
}

/** `POST /token` */
export async function handleToken(request: Request): Promise<Response> {
    const params = await readParams(request);
    const client = await authenticateClient(request, params);
    if (client instanceof Response) return client;

    try {
        switch (params.grant_type) {
            case 'authorization_code': {
                if (!params.code || !params.code_verifier) {
                    return oauthError('invalid_request', 'code and code_verifier are required');
                }
                const stored = await getAuthorizationCode(params.code);
                if (!stored || stored.clientId !== client.client_id) {
                    return oauthError('invalid_grant', 'Invalid authorization code');
                }
                const challenge = createHash('sha256').update(params.code_verifier).digest('base64url');
                if (challenge !== stored.codeChallenge) {
                    return oauthError('invalid_grant', 'code_verifier does not match the challenge');
                }
                if (params.redirect_uri && params.redirect_uri !== stored.redirectUri) {
                    return oauthError('invalid_grant', 'redirect_uri does not match');
                }
                return json(await exchangeAuthorizationCode(client, params.code));
            }
            case 'refresh_token': {
                if (!params.refresh_token) return oauthError('invalid_request', 'refresh_token is required');
                const scopes = params.scope ? params.scope.split(' ').filter(Boolean) : undefined;
                return json(await exchangeRefreshToken(client, params.refresh_token, scopes));
            }
            default:
                return oauthError('unsupported_grant_type', 'Supported: authorization_code, refresh_token');
        }
    } catch (error) {
        return oauthError('invalid_grant', error instanceof Error ? error.message : 'Invalid grant');
    }
}

/** `POST /register` — dynamic client registration (RFC 7591). */
export async function handleRegister(request: Request): Promise<Response> {
    const body = await request.json().catch(() => undefined);
    const parsed = OAuthClientMetadataSchema.safeParse(body);
    if (!parsed.success) {
        return oauthError('invalid_client_metadata', parsed.error.message);
    }

    const metadata = parsed.data;
    const isPublic = metadata.token_endpoint_auth_method === 'none';
    const info = await clientsStore.registerClient({
        ...metadata,
        ...(isPublic ? {} : { client_secret: generateSecret(), client_secret_expires_at: 0 }),
    });
    return json(info, 201);
}

/** `POST /revoke` (RFC 7009). Always 200 for a valid client, whether or not the token existed. */
export async function handleRevoke(request: Request): Promise<Response> {
    const params = await readParams(request);
    const client = await authenticateClient(request, params);
    if (client instanceof Response) return client;
    if (!params.token) return oauthError('invalid_request', 'token is required');

    await revokeToken(client, params.token);
    return json({});
}

export function handleAuthServerMetadata(request: Request): Response {
    return json(buildMetadata(request).oauthMetadata, 200, { 'Cache-Control': 'public, max-age=3600' });
}

export function handleProtectedResourceMetadata(request: Request): Response {
    return json(buildMetadata(request).protectedResourceMetadata, 200, { 'Cache-Control': 'public, max-age=3600' });
}

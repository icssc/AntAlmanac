/**
 * Fetch-API wiring for the MCP server, mounted at `/planner/api/mcp` (see `next/mcp.ts`).
 *
 * Exposes the OAuth 2.1 authorization-server endpoints (authorize/token/register/revoke +
 * discovery metadata), the OIDC callback, and the protected MCP endpoint itself (Streamable
 * HTTP, stateless). The OAuth logic lives in {@link ./oauth} and {@link ./provider}; the tools
 * live in {@link createMcpServer}.
 *
 * Discovery documents are served both under the `/planner/api/mcp` prefix and at the origin
 * root (`/.well-known/...`), since many MCP clients probe the host root (RFC 8414 / RFC 9728).
 * @module
 */

import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { MCP_BASE_PATH, MCP_DEV_BYPASS_AUTH, MCP_DEV_USER_ID, MCP_SCOPES, getMcpBaseUrl } from './config';
import {
    CORS_HEADERS,
    handleAuthServerMetadata,
    handleAuthorize,
    handleProtectedResourceMetadata,
    handleRegister,
    handleRevoke,
    handleToken,
    json,
} from './oauth';
import { handleMcpGoogleCallback, verifyAccessToken } from './provider';
import { createMcpServer } from './server';

if (MCP_DEV_BYPASS_AUTH) {
    console.warn(
        `⚠️  MCP_DEV_BYPASS_AUTH is ON — the MCP endpoint is UNAUTHENTICATED and every call acts as user ${MCP_DEV_USER_ID}. Never enable this in production.`
    );
}

function withCors(response: Response): Response {
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/**
 * Authenticate an MCP request via its bearer token. Returns the verified auth info, or a 401
 * response whose `WWW-Authenticate` header points clients at the protected-resource metadata.
 */
async function authenticate(request: Request): Promise<AuthInfo | Response> {
    // DEV/TEST ONLY: skip OAuth and act as a fixed user. See MCP_DEV_BYPASS_AUTH.
    if (MCP_DEV_BYPASS_AUTH) {
        return { token: 'dev-bypass', clientId: 'dev-bypass', scopes: MCP_SCOPES, extra: { userId: MCP_DEV_USER_ID } };
    }

    const unauthorized = (description: string) =>
        json({ error: 'invalid_token', error_description: description }, 401, {
            'WWW-Authenticate': `Bearer error="invalid_token", error_description="${description}", resource_metadata="${getMcpBaseUrl(request)}/.well-known/oauth-protected-resource"`,
        });

    const header = request.headers.get('authorization');
    const match = header?.match(/^Bearer\s+(.+)$/i);
    if (!match) return unauthorized('Missing Authorization header');

    try {
        return await verifyAccessToken(match[1].trim());
    } catch (error) {
        return unauthorized(error instanceof Error ? error.message : 'Invalid access token');
    }
}

/**
 * Handle a single MCP request. Stateless: a fresh server + transport per request, so it works
 * on serverless platforms that can't hold long-lived SSE connections. `enableJsonResponse`
 * returns a single JSON body instead of an SSE stream.
 */
async function handleMcpRequest(request: Request): Promise<Response> {
    // Stateless mode has no sessions to stream to or terminate; tell clients to just POST.
    if (request.method !== 'POST') {
        return json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed.' }, id: null }, 405, {
            Allow: 'POST',
        });
    }

    const authInfo = await authenticate(request);
    if (authInfo instanceof Response) return authInfo;

    const server = createMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
    });

    try {
        await server.connect(transport);
        return withCors(await transport.handleRequest(request, { authInfo }));
    } finally {
        void transport.close();
        void server.close();
    }
}

/** Route a request under `/planner/api/mcp` (or a root `/.well-known` probe) to its handler. */
export async function handleMcpHttpRequest(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const { pathname } = new URL(request.url);

    // DEV/TEST ONLY: with the auth bypass on, hide every OAuth endpoint so clients treat the
    // server as authless and connect directly, instead of starting a login that can't finish.
    if (MCP_DEV_BYPASS_AUTH && pathname !== MCP_BASE_PATH && pathname !== `${MCP_BASE_PATH}/`) {
        return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    }

    if (pathname.startsWith('/.well-known/oauth-authorization-server')) return handleAuthServerMetadata(request);
    if (pathname.startsWith('/.well-known/oauth-protected-resource')) return handleProtectedResourceMetadata(request);

    const subPath = pathname.startsWith(MCP_BASE_PATH) ? pathname.slice(MCP_BASE_PATH.length).replace(/\/$/, '') : null;
    if (subPath === null) return new Response('Not Found', { status: 404 });

    try {
        switch (subPath) {
            case '':
                return await handleMcpRequest(request);
            case '/authorize':
                return await handleAuthorize(request);
            case '/token':
                return request.method === 'POST' ? await handleToken(request) : methodNotAllowed('POST');
            case '/register':
                return request.method === 'POST' ? await handleRegister(request) : methodNotAllowed('POST');
            case '/revoke':
                return request.method === 'POST' ? await handleRevoke(request) : methodNotAllowed('POST');
            case '/auth/google/callback':
                return await handleMcpGoogleCallback(request);
            case '/.well-known/oauth-authorization-server':
                return handleAuthServerMetadata(request);
            case '/.well-known/oauth-protected-resource':
                return handleProtectedResourceMetadata(request);
            default:
                return new Response('Not Found', { status: 404 });
        }
    } catch (error) {
        console.error('MCP request error:', error);
        return json({ error: 'server_error', error_description: 'Internal server error' }, 500);
    }
}

function methodNotAllowed(allow: string): Response {
    return json({ error: 'invalid_request', error_description: 'Method not allowed' }, 405, { Allow: allow });
}

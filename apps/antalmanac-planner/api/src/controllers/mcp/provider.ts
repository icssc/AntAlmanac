/**
 * OAuth 2.1 authorization-server logic for the MCP server, backed by the `mcp_*` Postgres
 * tables. Identity is delegated to the existing OIDC provider (via `arctic`): `authorize`
 * bounces the browser to the provider, and {@link handleMcpGoogleCallback} resumes the flow,
 * enforces the @uci.edu requirement, and issues a one-time authorization code.
 *
 * The HTTP layer lives in {@link ./oauth}; this module only deals with persisted state.
 * @module
 */

import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import type { OAuthClientInformationFull, OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
import { CodeChallengeMethod, generateCodeVerifier } from 'arctic';
import { and, eq, gt } from 'drizzle-orm';

import { buildMcpRedirectUri, createOIDCClient } from '../../config/oidc';
import { db } from '../../db';
import { mcpAuthCode, mcpAuthRequest, mcpClient, mcpToken } from '../../db/schema';
import { upsertOidcUser, type OidcUserInfo } from '../../helpers/users';
import {
    MCP_ALLOWED_EMAIL_DOMAIN,
    MCP_AUTH_CODE_TTL_SECONDS,
    MCP_AUTH_REQUEST_TTL_SECONDS,
    MCP_SCOPES,
    MCP_TOKEN_TTL_SECONDS,
    generateSecret,
    getOrigin,
    hashSecret,
} from './config';

export interface AuthorizationParams {
    redirectUri: string;
    codeChallenge: string;
    scopes?: string[];
    state?: string;
}

function secondsFromNow(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
}

/** Append OAuth response params to a client redirect URI, preserving any existing query. */
export function buildRedirect(redirectUri: string, params: Record<string, string>): string {
    const url = new URL(redirectUri);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    return url.toString();
}

export function redirect(location: string): Response {
    return new Response(null, { status: 302, headers: { Location: location, 'Cache-Control': 'no-store' } });
}

export const clientsStore = {
    async getClient(clientId: string): Promise<OAuthClientInformationFull | undefined> {
        const [row] = await db.select().from(mcpClient).where(eq(mcpClient.clientId, clientId));
        return row ? (row.info as OAuthClientInformationFull) : undefined;
    },
    async registerClient(
        client: Omit<OAuthClientInformationFull, 'client_id' | 'client_id_issued_at'>
    ): Promise<OAuthClientInformationFull> {
        const clientId = generateSecret();
        const info: OAuthClientInformationFull = {
            ...client,
            client_id: clientId,
            client_id_issued_at: Math.floor(Date.now() / 1000),
        };
        await db.insert(mcpClient).values({ clientId, info });
        return info;
    },
};

async function mintTokens(userId: number, clientId: string, scopes: string[]): Promise<OAuthTokens> {
    const accessToken = generateSecret();
    const refreshToken = generateSecret();

    await db.insert(mcpToken).values([
        {
            tokenHash: hashSecret(accessToken),
            type: 'access',
            userId,
            clientId,
            scopes,
            expiresAt: secondsFromNow(MCP_TOKEN_TTL_SECONDS),
        },
        {
            tokenHash: hashSecret(refreshToken),
            type: 'refresh',
            userId,
            clientId,
            scopes,
            expiresAt: null,
        },
    ]);

    return {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: MCP_TOKEN_TTL_SECONDS,
        refresh_token: refreshToken,
        scope: scopes.join(' '),
    };
}

/**
 * Begin the authorization flow by stashing the request and redirecting to the OIDC provider.
 * The callback ({@link handleMcpGoogleCallback}) finishes issuing the code.
 */
export async function authorize(
    client: OAuthClientInformationFull,
    params: AuthorizationParams,
    request: Request
): Promise<Response> {
    const state = generateSecret();
    const googleCodeVerifier = generateCodeVerifier();
    const scopes = params.scopes?.length ? params.scopes : MCP_SCOPES;

    await db.insert(mcpAuthRequest).values({
        state,
        clientId: client.client_id,
        redirectUri: params.redirectUri,
        clientState: params.state ?? null,
        codeChallenge: params.codeChallenge,
        scopes,
        googleCodeVerifier,
        expiresAt: secondsFromNow(MCP_AUTH_REQUEST_TTL_SECONDS),
    });

    const oidcClient = createOIDCClient(buildMcpRedirectUri(getOrigin(request)));
    const authUrl = oidcClient.createAuthorizationURLWithPKCE(
        `${process.env.OIDC_ISSUER_URL}/authorize`,
        state,
        CodeChallengeMethod.S256,
        googleCodeVerifier,
        ['openid', 'profile', 'email']
    );
    // We require a UCI Google account: go straight to Google at the broker, and hint the
    // UCI hosted domain. Both are advisory — the @uci.edu check is enforced server-side in
    // the callback.
    authUrl.searchParams.set('provider', 'google');
    authUrl.searchParams.set('hd', 'uci.edu');
    return redirect(authUrl.toString());
}

/** Look up a stored authorization code (not yet consumed). */
export async function getAuthorizationCode(authorizationCode: string) {
    const [row] = await db
        .select()
        .from(mcpAuthCode)
        .where(eq(mcpAuthCode.codeHash, hashSecret(authorizationCode)));
    return row;
}

/** Consume a one-time authorization code and mint tokens for it. */
export async function exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string
): Promise<OAuthTokens> {
    const codeHash = hashSecret(authorizationCode);
    // Authorization codes are single-use: delete-and-return so concurrent exchanges can't both win.
    const [row] = await db.delete(mcpAuthCode).where(eq(mcpAuthCode.codeHash, codeHash)).returning();
    if (!row || row.clientId !== client.client_id || row.expiresAt.getTime() < Date.now()) {
        throw new Error('Invalid or expired authorization code');
    }
    return mintTokens(row.userId, row.clientId, row.scopes);
}

export async function exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
    scopes?: string[]
): Promise<OAuthTokens> {
    const tokenHash = hashSecret(refreshToken);
    const [row] = await db
        .select()
        .from(mcpToken)
        .where(and(eq(mcpToken.tokenHash, tokenHash), eq(mcpToken.type, 'refresh')));
    if (!row || row.clientId !== client.client_id) throw new Error('Invalid refresh token');
    // Requested scopes (if any) must be a subset of the originally granted scopes.
    const granted = scopes?.length ? scopes.filter((s) => row.scopes.includes(s)) : row.scopes;
    return mintTokens(row.userId, row.clientId, granted);
}

export async function verifyAccessToken(token: string): Promise<AuthInfo> {
    const [row] = await db
        .select()
        .from(mcpToken)
        .where(and(eq(mcpToken.tokenHash, hashSecret(token)), eq(mcpToken.type, 'access')));
    if (!row) throw new Error('Invalid access token');
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) throw new Error('Access token expired');
    return {
        token,
        clientId: row.clientId,
        scopes: row.scopes,
        expiresAt: row.expiresAt ? Math.floor(row.expiresAt.getTime() / 1000) : undefined,
        // The authenticated student's internal user id, read by tool handlers.
        extra: { userId: row.userId },
    };
}

export async function revokeToken(client: OAuthClientInformationFull, token: string): Promise<void> {
    await db
        .delete(mcpToken)
        .where(and(eq(mcpToken.tokenHash, hashSecret(token)), eq(mcpToken.clientId, client.client_id)));
}

/**
 * Resolve the internal user id carried by a verified MCP access token.
 * Returns `undefined` if the auth info is missing or malformed.
 */
export function userIdFromAuthInfo(auth: AuthInfo | undefined): number | undefined {
    const userId = auth?.extra?.userId;
    return typeof userId === 'number' ? userId : undefined;
}

/**
 * Handler for the OIDC callback in the MCP flow.
 *
 * Resumes the authorization request identified by `state`, exchanges the provider code,
 * enforces the @uci.edu requirement, upserts the user, and redirects back to the MCP
 * client with a one-time authorization code (or an OAuth error).
 */
export async function handleMcpGoogleCallback(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
        return new Response('Missing code or state', { status: 400 });
    }

    const [authRequest] = await db
        .delete(mcpAuthRequest)
        .where(and(eq(mcpAuthRequest.state, state), gt(mcpAuthRequest.expiresAt, new Date())))
        .returning();

    if (!authRequest) {
        return new Response('Invalid or expired authorization request', { status: 400 });
    }

    const clientStateParam: Record<string, string> = authRequest.clientState ? { state: authRequest.clientState } : {};

    try {
        const oidcClient = createOIDCClient(buildMcpRedirectUri(getOrigin(request)));
        const tokens = await oidcClient.validateAuthorizationCode(
            `${process.env.OIDC_ISSUER_URL}/token`,
            code,
            authRequest.googleCodeVerifier
        );

        const userInfoResponse = await fetch(`${process.env.OIDC_ISSUER_URL}/userinfo`, {
            headers: { Authorization: `Bearer ${tokens.accessToken()}` },
        });
        if (!userInfoResponse.ok) {
            return redirect(buildRedirect(authRequest.redirectUri, { error: 'server_error', ...clientStateParam }));
        }

        const userInfo = (await userInfoResponse.json()) as OidcUserInfo;

        if (!userInfo.email || !userInfo.email.toLowerCase().endsWith(MCP_ALLOWED_EMAIL_DOMAIN)) {
            return redirect(
                buildRedirect(authRequest.redirectUri, {
                    error: 'access_denied',
                    error_description: `Sign in with a ${MCP_ALLOWED_EMAIL_DOMAIN} Google account to use the AntAlmanac Planner MCP server.`,
                    ...clientStateParam,
                })
            );
        }

        const dbUser = await upsertOidcUser(userInfo);

        const authorizationCode = generateSecret();
        await db.insert(mcpAuthCode).values({
            codeHash: hashSecret(authorizationCode),
            userId: dbUser.id,
            clientId: authRequest.clientId,
            redirectUri: authRequest.redirectUri,
            codeChallenge: authRequest.codeChallenge,
            scopes: authRequest.scopes,
            expiresAt: secondsFromNow(MCP_AUTH_CODE_TTL_SECONDS),
        });

        return redirect(buildRedirect(authRequest.redirectUri, { code: authorizationCode, ...clientStateParam }));
    } catch (error) {
        console.error('MCP OIDC callback error:', error);
        return redirect(buildRedirect(authRequest.redirectUri, { error: 'server_error', ...clientStateParam }));
    }
}

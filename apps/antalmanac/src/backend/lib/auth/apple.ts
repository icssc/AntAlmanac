import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

const APPLE_JWKS_URL = new URL('https://appleid.apple.com/auth/keys');
const appleJWKS = createRemoteJWKSet(APPLE_JWKS_URL);

export interface AppleIdTokenClaims extends JWTPayload {
    sub: string;
    email?: string;
    email_verified?: string | boolean;
    is_private_email?: string | boolean;
}

/**
 * Verifies an Apple identity token (JWT) using Apple's public JWKS.
 *
 * @param identityToken - The JWT string from Sign in with Apple
 * @param expectedAudience - The audience (client_id / Services ID or bundle ID)
 *   that the token was issued for. Pass an array to accept multiple audiences
 *   (e.g. the web Services ID and the iOS bundle ID).
 */
export async function verifyAppleIdentityToken(
    identityToken: string,
    expectedAudience: string | string[]
): Promise<AppleIdTokenClaims> {
    const { payload } = await jwtVerify(identityToken, appleJWKS, {
        issuer: 'https://appleid.apple.com',
        audience: expectedAudience,
    });

    if (!payload.sub) {
        throw new Error('Apple identity token missing sub claim');
    }

    return payload as AppleIdTokenClaims;
}

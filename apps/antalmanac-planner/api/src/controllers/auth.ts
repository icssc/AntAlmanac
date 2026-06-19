import { CodeChallengeMethod, generateCodeVerifier, generateState } from 'arctic';
import { eq } from 'drizzle-orm';
import express, { type Request, type Response } from 'express';
import { SESSION_LENGTH } from '../config/constants';
import { buildRedirectUri, createOIDCClient } from '../config/oidc';
import { db } from '../db';
import { account, user, type providerEnum } from '../db/schema';
import { isNativeIosApp } from '../helpers/platform';

const router = express.Router();

function clearSharedCookie(req: Request, res: Response) {
  const isLocalhost = req.hostname === 'localhost';
  res.clearCookie('icssc_logged_in', {
    path: '/',
    ...(isLocalhost ? {} : { domain: 'antalmanac.com' }),
  });
}

interface OIDCUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
}

function providerFromSub(sub: string): (typeof providerEnum.enumValues)[number] {
  const prefix = sub.split('_')[0];
  switch (prefix) {
    case 'google':
      return 'GOOGLE';
    case 'apple':
      return 'APPLE';
    default:
      throw new Error(`Unknown provider prefix in sub: ${sub}`);
  }
}

async function successLogin(userInfo: OIDCUserInfo, req: Request, res: Response) {
  const { sub, email, name, picture } = userInfo;
  const provider = providerFromSub(sub);

  /**
   * TODO: Some legacy user accounts do not have an email associated, but do have a google id.
   *
   * We would like to handle this case gracefully, by handling conflicts on google id OR email.
   * At the time of writing (2025-12-07), Drizzle does not have such a mechanism.
   * Possible methods include updating a user based on google id, then manually inserting if no such user exists,
   * or using a raw SQL query
   */
  const userData = await db.transaction(async (tx) => {
    let [dbUser] = await tx.select().from(user).where(eq(user.email, email));

    if (dbUser) {
      await tx
        .update(user)
        .set({
          name: name || dbUser.name,
          picture: picture || dbUser.picture,
        })
        .where(eq(user.id, dbUser.id));
      dbUser = { ...dbUser, name: name || dbUser.name };
    } else {
      [dbUser] = await tx
        .insert(user)
        .values({
          name: name ?? '',
          email,
          picture: picture ?? '',
        })
        .returning();
    }

    await tx
      .insert(account)
      .values({
        userId: dbUser.id,
        provider,
        providerAccountId: sub,
      })
      .onConflictDoNothing();

    return dbUser;
  });

  req.session.userId = userData.id;
  req.session.userName = userData.name;
  const allowedUsers = JSON.parse(process.env.ADMIN_EMAILS ?? '[]');
  if (allowedUsers.includes(userData.email)) {
    req.session.isAdmin = true;
  }

  const isLocalhost = req.hostname === 'localhost';
  res.cookie('icssc_logged_in', '1', {
    path: '/',
    ...(isLocalhost ? {} : { domain: 'antalmanac.com' }),
    maxAge: SESSION_LENGTH,
    sameSite: 'lax',
    secure: !isLocalhost,
  });

  const returnTo = req.session.returnTo ?? '/';
  delete req.session.returnTo;
  res.redirect(returnTo);
}

/**
 * Initiate authentication with OIDC
 */
router.get('/google', async (req, res) => {
  try {
    const redirectUri = buildRedirectUri(isNativeIosApp(req));
    const oidcClient = createOIDCClient(redirectUri);
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    req.session.oauthState = state;
    req.session.codeVerifier = codeVerifier;
    req.session.oauthRedirectUri = redirectUri;
    req.session.returnTo = req.headers.referer;

    const authUrl = oidcClient.createAuthorizationURLWithPKCE(
      `${process.env.OIDC_ISSUER_URL}/authorize`,
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      ['openid', 'profile', 'email'],
    );

    const provider = req.query.provider;
    if (provider === 'apple' || provider === 'google') {
      authUrl.searchParams.set('provider', provider);
    }

    if (req.query.prompt === 'none') {
      authUrl.searchParams.set('prompt', 'none');
    }

    res.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error initiating authentication:', error);
    res.redirect('/?error=auth_failed');
  }
});

/**
 * Callback for OIDC authentication
 */
router.get('/google/callback', async (req, res) => {
  const returnTo = req.session.returnTo ?? '/planner';

  // Handle error=login_required from silent SSO attempt
  if (req.query.error === 'login_required') {
    clearSharedCookie(req, res);
    res.redirect(returnTo);
    return;
  }

  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const storedState = req.session.oauthState;
    const codeVerifier = req.session.codeVerifier;

    if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
      console.error('Invalid OAuth state or code');
      res.redirect('/?error=invalid_state');
      return;
    }

    const redirectUri = req.session.oauthRedirectUri ?? buildRedirectUri(isNativeIosApp(req));

    delete req.session.oauthState;
    delete req.session.codeVerifier;
    delete req.session.oauthRedirectUri;

    const oidcClient = createOIDCClient(redirectUri);
    const tokens = await oidcClient.validateAuthorizationCode(
      `${process.env.OIDC_ISSUER_URL}/token`,
      code,
      codeVerifier,
    );

    const userInfoEndpoint = `${process.env.OIDC_ISSUER_URL}/userinfo`;
    const userInfoResponse = await fetch(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch user info:', userInfoResponse.statusText);
      res.redirect('/?error=userinfo_failed');
      return;
    }

    const userInfo: OIDCUserInfo = await userInfoResponse.json();

    if (!userInfo.email) {
      console.error('Email not provided by OIDC provider');
      res.redirect('/?error=no_email');
      return;
    }

    req.session.returnTo = returnTo;
    await successLogin(userInfo, req, res);
  } catch (error) {
    console.error('Error in OIDC callback:', error);
    res.redirect('/?error=callback_failed');
  }
});

/**
 * Fallback for the native-only callback path.
 *
 * In the normal native flow, ASWebAuthenticationSession captures the callback
 * URL via AASA before any network request is made, and the iOS wrapper rewrites
 * `/callback/native` → `/callback` before loading it in the WKWebView. The
 * server should therefore never see this path.
 *
 * This route exists as a safety net for the narrow window where AASA has not
 * yet propagated (fresh install, Apple CDN cache miss on iOS 17.4+): the flow
 * still recovers gracefully inside the WKWebView instead of 404ing.
 */
router.get('/google/callback/native', (req, res) => {
  const queryIndex = req.originalUrl.indexOf('?');
  const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
  res.redirect(302, `/planner/api/users/auth/google/callback${query}`);
});

/**
 * Endpoint to logout
 */
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    // clear the user cookie
    res.clearCookie('user');

    clearSharedCookie(req, res);

    // Redirect to OIDC logout endpoint
    const logoutUrl = new URL(`${process.env.OIDC_ISSUER_URL}/logout`);
    logoutUrl.searchParams.set('post_logout_redirect_uri', `${process.env.PRODUCTION_DOMAIN}/planner`);

    res.redirect(logoutUrl.toString());
  });
});

export default router;

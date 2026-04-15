import express, { Request, Response } from 'express';
import { CodeChallengeMethod, generateCodeVerifier, generateState } from 'arctic';
import { db } from '../db';
import { user } from '../db/schema';
import { createOIDCClient } from '../config/oidc';
import { SESSION_LENGTH } from '../config/constants';

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

/**
 * Called after successful authentication
 * Matches user by email and updates/creates user record
 * @param userInfo OIDC user information
 * @param req Express Request Object
 * @param res Express Response Object
 */
async function successLogin(userInfo: OIDCUserInfo, req: Request, res: Response) {
  const { sub, email, name, picture } = userInfo;

  /**
   * TODO: Some legacy user accounts do not have an email associated, but do have a google id.
   *
   * We would like to handle this case gracefully, by handling conflicts on google id OR email.
   * At the time of writing (2025-12-07), Drizzle does not have such a mechanism.
   * Possible methods include updating a user based on google id, then manually inserting if no such user exists,
   * or using a raw SQL query
   */
  const userData = await db
    .insert(user)
    .values({
      googleId: sub,
      name: name ?? '',
      email,
      picture: picture ?? '',
    })
    .onConflictDoUpdate({
      target: [user.email],
      set: {
        googleId: sub,
        name: name ?? '',
        email,
        picture: picture ?? '',
      },
    })
    .returning();

  req.session.userId = userData[0].id;
  req.session.userName = userData[0].name;
  const allowedUsers = JSON.parse(process.env.ADMIN_EMAILS ?? '[]');
  if (allowedUsers.includes(userData[0].email)) {
    req.session.isAdmin = true;
  }

  // Set shared SSO cookie for cross-app sign-in
  const isLocalhost = req.hostname === 'localhost';
  res.cookie('icssc_logged_in', '1', {
    path: '/',
    ...(isLocalhost ? {} : { domain: 'antalmanac.com' }),
    maxAge: SESSION_LENGTH,
    sameSite: 'lax',
    secure: !isLocalhost,
  });

  // redirect browser to the page they came from
  const returnTo = req.session.returnTo ?? '/';
  delete req.session.returnTo;
  res.redirect(returnTo!);
}

/**
 * Initiate authentication with OIDC
 */
router.get('/google', async function (req, res) {
  try {
    const oidcClient = createOIDCClient();
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    req.session.oauthState = state;
    req.session.codeVerifier = codeVerifier;
    req.session.returnTo = req.headers.referer;

    const authUrl = oidcClient.createAuthorizationURLWithPKCE(
      `${process.env.OIDC_ISSUER_URL}/authorize`,
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      ['openid', 'profile', 'email'],
    );

    // Support prompt=none for silent SSO
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
router.get('/google/callback', async function (req, res) {
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

    delete req.session.oauthState;
    delete req.session.codeVerifier;

    const oidcClient = createOIDCClient();
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
 * Endpoint to logout
 */
router.get('/logout', function (req, res) {
  req.session.destroy(function (err) {
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

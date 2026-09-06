import WebKit

struct Cookie {
    var name: String
    var value: String
}

let gcmMessageIDKey = "00000000000" // update this with actual ID if using Firebase 

// URL for first launch
let rootUrl = URL(string: "https://antalmanac.com")!

// allowed origin is for what we are sticking to the web app domain
// This should also appear in Info.plist
let allowedOrigins: [String] = ["antalmanac.com"]

// IdP host for ICSSC. Interactive /authorize and /logout use ASWebAuthenticationSession
// so they share Safari's cookie jar. See `shouldHandOffOidcToASWebAuthenticationSession(_:)`.
let authOrigins: [String] = ["auth.icssc.club"]

struct AuthHandoffCallback {
    let host: String
    let path: String
}

func isOidcLogoutURL(_ url: URL) -> Bool {
    guard let host = url.host else { return false }
    guard authOrigins.contains(where: { host.range(of: $0) != nil }) else { return false }
    return url.path.hasPrefix("/logout")
}

/// `true` for URLs that must run in Safari (ASWebAuthenticationSession), not WKWebView.
///
/// Interactive `/authorize` needs Safari for Google OAuth and passkeys.
/// `/logout` must also run in Safari: sign-in writes the HttpOnly `sid` cookie
/// into Safari's jar, and auth.icssc.club/logout only deletes that session when
/// it receives the cookie. WKWebView has a separate jar, so in-app logout
/// appears to succeed while the next ASW sign-in silently reuses the old
/// account (icssc/AntAlmanac#1829, icssc/auth#8).
func shouldHandOffOidcToASWebAuthenticationSession(_ url: URL) -> Bool {
    guard let host = url.host else { return false }
    guard authOrigins.contains(where: { host.range(of: $0) != nil }) else { return false }

    if url.path.hasPrefix("/logout") {
        return true
    }

    guard url.path.hasPrefix("/authorize") else { return false }

    // prompt=none is a silent-SSO probe (AutoSignIn). auth.icssc.club either
    // redirects back immediately off its own session cookie, or returns
    // error=login_required — no Google hop, no passkey UX, no user-visible
    // interaction. Handing this to ASW would pop a consent sheet on every
    // cold launch for unsigned users with a lingering icssc_logged_in
    // hint cookie, which defeats the "silent" part of silent SSO.
    //
    // The auth.icssc.club session cookie normally lives in Safari's jar
    // (ASW wrote it during a prior interactive sign-in), so the
    // WKWebView-direct attempt will usually fail with login_required —
    // which AuthPage.tsx handles gracefully by clearing the SSO hint and
    // redirecting to /. Worst case it's a no-op; best case the cookie
    // happens to be in the WKWebView jar (same-install planner sign-in,
    // etc.) and the user is silently re-authed.
    let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
    let prompt = components?.queryItems?.first(where: { $0.name == "prompt" })?.value
    if prompt == "none" {
        return false
    }

    return true
}

/// HTTPS callback that should terminate ASWebAuthenticationSession.
/// Authorize uses `redirect_uri`; logout uses `post_logout_redirect_uri`.
func authHandoffCallback(for url: URL) -> AuthHandoffCallback {
    let isLogout = url.path.hasPrefix("/logout")
    let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
    let paramName = isLogout ? "post_logout_redirect_uri" : "redirect_uri"
    let redirectURI = components?.queryItems?
        .first(where: { $0.name == paramName })?
        .value
        .flatMap { URL(string: $0) }

    let host = redirectURI?.host ?? "antalmanac.com"
    let defaultPath = isLogout ? "/" : "/api/auth/oauth2/callback/icssc"
    let rawPath = redirectURI?.path ?? defaultPath
    let path = rawPath.isEmpty ? "/" : rawPath
    return AuthHandoffCallback(host: host, path: path)
}

let platformCookie = Cookie(name: "app-platform", value: "iOS App Store")

// UI options
let displayMode = "standalone" // standalone / fullscreen.
let adaptiveUIStyle = true     // iOS 15+ only. Change app theme on the fly to dark/light related to WebView background color.
let overrideStatusBar = false   // iOS 13-14 only. if you don't support dark/light system theme.
let statusBarTheme = "dark"    // dark / light, related to override option.
let pullToRefresh = true    // Enable/disable pull down to refresh page

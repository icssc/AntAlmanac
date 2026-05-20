package com.icssc.antalmanac

import android.net.Uri

/**
 * Compile-time configuration. Direct port of apps/pwa/src/AntAlmanac/Settings.swift.
 * Anything user-tunable about wrapper behaviour lives here, not scattered across
 * the activity/view classes.
 */
object Settings {
    /** URL loaded on first launch and on cold restart. Maps to `rootUrl` on iOS. */
    val ROOT_URL: Uri = Uri.parse("https://antalmanac.com")

    /**
     * Hosts the WebView is allowed to navigate to. Anything else opens in
     * Chrome Custom Tabs (or the user's default browser) so the wrapper
     * stays scoped to the AntAlmanac domain. Mirrors `allowedOrigins`
     * + the WKAppBoundDomains entry in iOS Info.plist.
     */
    val ALLOWED_ORIGINS: List<String> = listOf("antalmanac.com")

    /**
     * IdP host for ICSSC OAuth. Not every path here should hand off to a
     * Custom Tab — only interactive /authorize requests. See
     * [shouldHandOffOidcToCustomTab].
     */
    val AUTH_ORIGINS: List<String> = listOf("auth.icssc.club")

    /**
     * Platform marker cookie. The web app reads this in
     * apps/antalmanac/src/lib/platform.ts (`isNativeAndroidApp`) to decide
     * whether to use the in-app OAuth redirect URI
     * (`NATIVE_ANDROID_REDIRECT_URI` = `/auth/native`) instead of the
     * standard web `/auth` callback.
     */
    val PLATFORM_COOKIE = Cookie(name = "app-platform", value = "Google Play")

    /**
     * Mirrors iOS `displayMode`. "standalone" hides the system status bar
     * region behind the WebView (PWA-style). "fullscreen" goes edge-to-edge
     * and is the closest analogue of iOS fullscreen mode.
     */
    const val DISPLAY_MODE: String = "standalone"

    /**
     * If true, the activity tracks the WebView's `theme-color` meta and
     * switches the system UI between light/dark to match. Direct port of
     * iOS `adaptiveUIStyle`.
     */
    const val ADAPTIVE_UI_STYLE: Boolean = true

    /** Enable / disable pull-to-refresh via SwipeRefreshLayout. */
    const val PULL_TO_REFRESH: Boolean = true

    /**
     * Firebase Cloud Messaging notification ID key. The wrapper logs the
     * value if the FCM payload includes it. Update to the project's actual
     * gcm.message_id once Firebase is provisioned.
     */
    const val GCM_MESSAGE_ID_KEY: String = "gcm.message_id"
}

/** Plain holder so call sites read like `cookie.name`, not `cookie.first`. */
data class Cookie(val name: String, val value: String)

/**
 * Whether the given URL should be cancelled and re-opened in a Chrome Custom
 * Tab. Equivalent of the Swift `shouldHandOffOidcToASWebAuthenticationSession`.
 *
 * Two reasons for the hand-off:
 *
 *  1. Google rejects OAuth inside Android `WebView` with `disallowed_useragent`
 *     since 2021-09-30 (same policy as iOS WKWebView).
 *  2. WebAuthn / passkey assertions for third-party RPs (google.com) only
 *     work in a top-level Chrome context — they don't traverse the WebView's
 *     embedded browsing context.
 *
 * `/logout` and other IdP utility paths intentionally stay inside the
 * WebView so the post-logout redirect cookies are cleared in the same
 * cookie jar that the app reads from.
 *
 * `prompt=none` is a silent SSO probe: handing it to a Custom Tab would
 * flash a Chrome window on every cold launch for users with a lingering
 * icssc_logged_in hint cookie. Let the WebView attempt it directly — it
 * either succeeds silently off the WebView's own cookie jar or returns
 * `error=login_required`, which AuthPage.tsx handles gracefully.
 */
fun shouldHandOffOidcToCustomTab(uri: Uri): Boolean {
    val host = uri.host ?: return false
    if (Settings.AUTH_ORIGINS.none { host.contains(it) }) return false
    if (uri.path?.startsWith("/authorize") != true) return false
    if (uri.getQueryParameter("prompt") == "none") return false
    return true
}

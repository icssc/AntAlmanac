package com.icssc.antalmanac

import android.annotation.SuppressLint
import android.webkit.CookieManager
import android.webkit.WebView
import androidx.webkit.WebViewFeature

/**
 * WebView construction + cookie seeding. Direct port of
 * apps/pwa/src/AntAlmanac/WebView.swift (the `createWebView` /
 * `setCustomCookie` free functions, not the WKUIDelegate extension —
 * the equivalent of that lives in [MainActivity]).
 *
 * Kept as standalone functions on a singleton (rather than a class) because
 * Android's `WebView` already pre-baked too much state for inheritance to be
 * worth the indirection.
 */
object WebViewFactory {

    /**
     * Configure a freshly-instantiated [WebView] for hosting AntAlmanac.
     *
     * The view is created by the layout inflater (see
     * `res/layout/activity_main.xml`) rather than here, so this function only
     * mutates: settings, the cookie jar, and the user-agent string.
     */
    @SuppressLint("SetJavaScriptEnabled")
    fun configure(webView: WebView, jsBridge: JsBridge) {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true

            // Mirrors WKWebViewConfiguration.allowsInlineMediaPlayback +
            // mediaPlaybackRequiresUserAction = false.
            mediaPlaybackRequiresUserGesture = false

            // Mirrors `javaScriptCanOpenWindowsAutomatically = true` on iOS.
            // Required so the print bridge can dispatch its own popup-style
            // events.
            javaScriptCanOpenWindowsAutomatically = true
            setSupportMultipleWindows(true)

            // Mirrors the iOS user-agent override in WebView.swift. The
            // appended `; AntAlmanac/Android` token lets the web app detect
            // the wrapper if it ever needs to short-circuit "install our
            // app" UI (the platform cookie is the primary signal — this is
            // just a backup that survives even if cookies are wiped).
            userAgentString = "$userAgentString AntAlmanac/Android"

            // No iOS equivalent — these are Android-only defaults that lean
            // toward modern-web behaviour.
            loadWithOverviewMode = false
            useWideViewPort = true
            allowFileAccess = false
            allowContentAccess = false
        }

        // Inspector parity: iOS sets `webView.isInspectable = true` for
        // iOS 16.4+. Android's equivalent is the global
        // `WebView.setWebContentsDebuggingEnabled(true)`, which is gated on
        // debug builds in [MainActivity.onCreate].

        // Mirrors `setCustomCookie` on iOS — we seed the platform cookie on
        // the AntAlmanac domain so the JS check in lib/platform.ts fires
        // before the very first XHR.
        setPlatformCookie()

        // JS -> Kotlin bridge for print + push handling. Mirrors the
        // userContentController.add(WKSMH, name: ...) calls in WebView.swift,
        // routed through a single object instead of one handler per name.
        webView.addJavascriptInterface(jsBridge, JsBridge.NAME)

        // Algorithmic darkening for sites that don't ship a dark stylesheet.
        // Closest analogue of iOS's `adaptiveUIStyle` flipping the system
        // bar to match the page's themeColor — but the actual UI flip
        // happens in MainActivity, which listens for theme-color via a
        // CSS variable bridge.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            androidx.webkit.WebSettingsCompat.setAlgorithmicDarkeningAllowed(
                webView.settings,
                true,
            )
        }

        // Useful for debugging on real devices. Identical to iOS's
        // `webView.isInspectable`. Guarded by BuildConfig.DEBUG so release
        // builds don't expose `chrome://inspect`.
        if (BuildConfig.DEBUG) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        // Safe Browsing stays on (the default) because the WebView is
        // confined to antalmanac.com / auth.icssc.club, both of which are
        // whitelisted by Google. No further wiring needed.
    }

    /**
     * Persist `app-platform=Google Play` on the AntAlmanac domain. Mirrors
     * iOS `setCustomCookie`.
     *
     * Done via [CookieManager] (global to the process) rather than a
     * WebView-local store so the cookie survives across activity recreations
     * and incognito-style cookie purges only triggered by explicit user
     * action.
     */
    private fun setPlatformCookie() {
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)

        val host = Settings.ROOT_URL.host ?: return
        val cookie = "${Settings.PLATFORM_COOKIE.name}=${Settings.PLATFORM_COOKIE.value}; " +
            "Path=/; Domain=$host; Max-Age=31556926; SameSite=Lax; Secure"

        cookieManager.setCookie("https://$host", cookie)
        cookieManager.flush()
    }
}

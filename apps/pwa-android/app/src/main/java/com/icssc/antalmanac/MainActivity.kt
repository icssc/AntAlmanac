package com.icssc.antalmanac

import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import com.icssc.antalmanac.databinding.ActivityMainBinding

/**
 * Main activity. Composite port of:
 *
 *   apps/pwa/src/AntAlmanac/ViewController.swift  (WebView host + nav delegate)
 *   apps/pwa/src/AntAlmanac/SceneDelegate.swift   (deep-link / universal-link routing)
 *
 * Activity-as-scene-and-controller works on Android because the two iOS
 * abstractions (UIScene + UIViewController) collapse into Activity here.
 *
 * Lifecycle sketch:
 *
 *   onCreate              -> inflate, configure WebView, load Settings.ROOT_URL
 *   onNewIntent           -> App Link tap while running (SceneDelegate `continue userActivity`)
 *   onBackPressed         -> webView.canGoBack() ? goBack : super
 *   onRequestPermissions  -> forwards POST_NOTIFICATIONS result to PushNotifications
 */
class MainActivity : AppCompatActivity(), JsBridge.BridgeHandler {

    private lateinit var binding: ActivityMainBinding
    private lateinit var pushNotifications: PushNotifications

    /**
     * Result of an OAuth Custom Tab. The deep link is delivered as an
     * Intent.ACTION_VIEW to a fresh task by the App Links system; with
     * `launchMode="singleTask"` it lands in [onNewIntent] of this activity.
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        // installSplashScreen() must run before super.onCreate so the
        // AndroidX SplashScreen compat layer can swap the splash theme for
        // the regular app theme without flicker. Equivalent of how
        // LaunchScreen.storyboard transitions to Main.storyboard on iOS.
        val splashScreen = installSplashScreen()
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configureWindowChrome()
        configureWebView()
        configureSwipeRefresh()
        configureBackNav()

        pushNotifications = PushNotifications(this) { binding.webView }

        // Hold the splash on screen until the first page paints, so users
        // don't see a white flash between splash and the WebView's first
        // frame. Mirrors iOS hiding `loadingView` once the WebView's
        // estimatedProgress crosses ~0.8 in ViewController.swift.
        splashScreen.setKeepOnScreenCondition {
            binding.webView.progress < 80
        }

        // Initial load. Universal-link / shortcut routing on iOS lives in
        // SceneDelegate.willConnectTo; here it's just `handleIntent` on the
        // intent that started us.
        val initialUrl = resolveInitialUrl(intent)
        binding.webView.loadUrl(initialUrl.toString())
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        // Equivalent of SceneDelegate `continue userActivity` + `openURLContexts`:
        // when the user (or an OAuth Custom Tab) hands us an https URL, route
        // it inside the WebView in an SPA-friendly way rather than reloading
        // root.
        val url = intent.data ?: return
        routeIncomingLink(url)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        pushNotifications.onRequestPermissionsResult(requestCode, grantResults)
    }

    // -------- WebView setup -------------------------------------------------

    private fun configureWebView() {
        val bridge = JsBridge(this)
        WebViewFactory.configure(binding.webView, bridge)
        binding.webView.webViewClient = AntAlmanacWebViewClient()
        binding.webView.webChromeClient = AntAlmanacWebChromeClient()
    }

    private fun configureWindowChrome() {
        // iOS adaptiveUIStyle = true equivalent: let the WebView's theme-color
        // drive the system bar tint. WindowCompat.setDecorFitsSystemWindows
        // matches Settings.DISPLAY_MODE = "standalone" — content draws behind
        // the status bar, the WebView itself adds the inset.
        WindowCompat.setDecorFitsSystemWindows(window, Settings.DISPLAY_MODE != "fullscreen")
        if (Settings.DISPLAY_MODE == "fullscreen") {
            window.statusBarColor = Color.TRANSPARENT
        }
    }

    private fun configureSwipeRefresh() {
        binding.swipeRefresh.isEnabled = Settings.PULL_TO_REFRESH
        binding.swipeRefresh.setOnRefreshListener { binding.webView.reload() }
    }

    private fun configureBackNav() {
        // Android's hardware/gesture back maps to iOS's edge-swipe-back. The
        // iOS wrapper sets `allowsBackForwardNavigationGestures = true`; the
        // closest Android analogue is intercepting back and forwarding it
        // into the WebView's history.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    // -------- Link routing --------------------------------------------------

    /**
     * Decide what URL to load on cold launch. Mirrors
     * `SceneDelegate.willConnectTo` precedence: universal link > shortcut >
     * scheme URL > [Settings.ROOT_URL].
     */
    private fun resolveInitialUrl(intent: Intent?): Uri {
        val deepLink = intent?.takeIf { it.action == Intent.ACTION_VIEW }?.data
        if (deepLink != null && isAllowedOrigin(deepLink)) return deepLink

        // Push-tap launches arrive with the payload extra set. We re-open
        // ROOT_URL and let the WebView's own SPA router consume the path —
        // matching the iOS `sendPushClickToWebView` event dispatch.
        return Settings.ROOT_URL
    }

    /**
     * Forward an incoming https URL into the running WebView in an
     * SPA-friendly way (assign `location.href` rather than reloading).
     * Equivalent of SceneDelegate's universal-link handler.
     */
    private fun routeIncomingLink(url: Uri) {
        if (!isAllowedOrigin(url)) return
        val js = "location.href = '${url.toString().replace("'", "\\'")}'"
        binding.webView.evaluateJavascript(js, null)
    }

    private fun isAllowedOrigin(url: Uri): Boolean {
        val host = url.host ?: return false
        return Settings.ALLOWED_ORIGINS.any { host.contains(it) } ||
            Settings.AUTH_ORIGINS.any { host.contains(it) }
    }

    // -------- WebViewClient -------------------------------------------------

    private inner class AntAlmanacWebViewClient : WebViewClient() {

        override fun shouldOverrideUrlLoading(
            view: WebView,
            request: WebResourceRequest,
        ): Boolean {
            val url = request.url ?: return false
            val host = url.host ?: run {
                // Non-http schemes (tel:, mailto:) — let the system handle.
                return openExternally(url)
            }

            // OIDC hand-off to Chrome Custom Tab. Direct analogue of
            // ViewController.startAuthSession on iOS.
            if (Settings.AUTH_ORIGINS.any { host.contains(it) }) {
                if (shouldHandOffOidcToCustomTab(url)) {
                    startAuthSession(url)
                    return true
                }
                // Other IdP paths (e.g. /logout) load in-app.
                return false
            }

            if (Settings.ALLOWED_ORIGINS.any { host.contains(it) }) {
                return false
            }

            return openExternally(url)
        }

        override fun onReceivedError(
            view: WebView,
            request: WebResourceRequest,
            error: WebResourceError,
        ) {
            super.onReceivedError(view, request, error)
            // Mirrors iOS `didFailProvisionalNavigation`: only react to
            // main-frame failures, ignore sub-resource errors.
            if (!request.isForMainFrame) return
            binding.webView.visibility = View.INVISIBLE
            binding.connectionProblem.visibility = View.VISIBLE
        }

        override fun onPageFinished(view: WebView, url: String?) {
            super.onPageFinished(view, url)
            binding.swipeRefresh.isRefreshing = false
            binding.connectionProblem.visibility = View.GONE
            binding.webView.visibility = View.VISIBLE
        }
    }

    private inner class AntAlmanacWebChromeClient : WebChromeClient() {

        override fun onProgressChanged(view: WebView, newProgress: Int) {
            binding.progressBar.progress = newProgress
            binding.progressBar.visibility =
                if (newProgress < 100) View.VISIBLE else View.GONE
        }

        /**
         * Mirrors `runJavaScriptAlertPanelWithMessage` on iOS. Default
         * WebChromeClient already shows native dialogs — we override only
         * to ensure they obey the host theme.
         */
        override fun onJsAlert(
            view: WebView,
            url: String?,
            message: String,
            result: JsResult,
        ): Boolean {
            AlertDialog.Builder(this@MainActivity)
                .setMessage(message)
                .setPositiveButton(android.R.string.ok) { _, _ -> result.confirm() }
                .setOnCancelListener { result.cancel() }
                .show()
            return true
        }

        override fun onJsConfirm(
            view: WebView,
            url: String?,
            message: String,
            result: JsResult,
        ): Boolean {
            AlertDialog.Builder(this@MainActivity)
                .setMessage(message)
                .setPositiveButton(android.R.string.ok) { _, _ -> result.confirm() }
                .setNegativeButton(android.R.string.cancel) { _, _ -> result.cancel() }
                .setOnCancelListener { result.cancel() }
                .show()
            return true
        }
    }

    // -------- External / OAuth handoff -------------------------------------

    /**
     * Open `url` in Chrome Custom Tab. Direct counterpart of iOS's
     * ASWebAuthenticationSession start. Two key differences from iOS:
     *
     *  1. Custom Tabs doesn't accept an HTTPS callback registration up
     *     front — the callback returns via the App Links system, which is
     *     why this activity declares the autoVerify intent filter in
     *     AndroidManifest.xml.
     *
     *  2. There's no cancellation callback. If the user dismisses the
     *     Custom Tab without completing OAuth, the WebView simply stays on
     *     the page that initiated the request — fine for the IdP flow,
     *     since AuthPage.tsx on the web side handles the "user gave up"
     *     state when no callback arrives.
     */
    private fun startAuthSession(url: Uri) {
        val intent = CustomTabsIntent.Builder()
            .setShowTitle(true)
            .setUrlBarHidingEnabled(false)
            .build()
        intent.launchUrl(this, url)
    }

    private fun openExternally(url: Uri): Boolean {
        return try {
            startActivity(Intent(Intent.ACTION_VIEW, url))
            true
        } catch (e: Exception) {
            false
        }
    }

    // -------- JsBridge.BridgeHandler ---------------------------------------

    override fun runOnUi(block: () -> Unit) {
        runOnUiThread(block)
    }

    override fun onPrint() {
        printWebView(this, binding.webView)
    }

    override fun onPushSubscribe(messageJson: String) {
        pushNotifications.handleSubscribe(messageJson)
    }

    override fun onPushPermissionRequest() {
        pushNotifications.handlePermissionRequest()
    }

    override fun onPushPermissionState() {
        pushNotifications.handlePermissionState()
    }

    override fun onPushToken() {
        pushNotifications.handleToken()
    }

    init {
        // Default to following the system light/dark setting. iOS's
        // adaptiveUIStyle observes the WebView theme-color and overrides
        // dynamically; Android relies on the theme + DayNight, which is
        // applied here once per process.
        AppCompatDelegate.setDefaultNightMode(
            if (Settings.ADAPTIVE_UI_STYLE) AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
            else AppCompatDelegate.MODE_NIGHT_NO,
        )
    }
}

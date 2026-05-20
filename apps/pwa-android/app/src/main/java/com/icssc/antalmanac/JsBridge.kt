package com.icssc.antalmanac

import android.webkit.JavascriptInterface

/**
 * JS -> Kotlin bridge. Single-class equivalent of the per-name
 * `WKScriptMessageHandler` registrations on iOS:
 *
 *   userContentController.add(self, name: "print")
 *   userContentController.add(self, name: "push-subscribe")
 *   userContentController.add(self, name: "push-permission-request")
 *   userContentController.add(self, name: "push-permission-state")
 *   userContentController.add(self, name: "push-token")
 *
 * On Android `@JavascriptInterface` methods live on a single object, exposed
 * to JS under [NAME]. The web app calls
 *
 *   window.AntAlmanacBridge.print()
 *   window.AntAlmanacBridge.pushSubscribe(JSON.stringify({ topic, unsubscribe }))
 *   window.AntAlmanacBridge.pushPermissionRequest()
 *   window.AntAlmanacBridge.pushPermissionState()
 *   window.AntAlmanacBridge.pushToken()
 *
 * which the iOS wrapper exposes as `window.webkit.messageHandlers.X.postMessage(...)`.
 * The web app should detect both shapes and pick the one available.
 *
 * Methods marshal back to the main thread + delegate to [BridgeHandler], so
 * this class stays a thin trampoline that's safe to call from JS without
 * touching Android lifecycle objects.
 */
class JsBridge(private val handler: BridgeHandler) {

    /** Print the current WebView contents. Mirrors iOS `printView`. */
    @JavascriptInterface
    fun print() {
        handler.runOnUi { handler.onPrint() }
    }

    /**
     * Subscribe / unsubscribe an FCM topic. The body is the same JSON string
     * the iOS handler expects, so the web-side bridge code is shared.
     */
    @JavascriptInterface
    fun pushSubscribe(message: String) {
        handler.runOnUi { handler.onPushSubscribe(message) }
    }

    /**
     * Request notification permission. Resolves with a CustomEvent on the
     * `window` object whose `detail` is `"granted"` or `"denied"` —
     * identical contract to PushNotifications.swift.
     */
    @JavascriptInterface
    fun pushPermissionRequest() {
        handler.runOnUi { handler.onPushPermissionRequest() }
    }

    /** Returns the current permission state via the same CustomEvent shape. */
    @JavascriptInterface
    fun pushPermissionState() {
        handler.runOnUi { handler.onPushPermissionState() }
    }

    /** Fetches the FCM registration token and dispatches it as `push-token`. */
    @JavascriptInterface
    fun pushToken() {
        handler.runOnUi { handler.onPushToken() }
    }

    /**
     * Methods the activity implements to actually do the work. Kept as an
     * interface so the bridge stays trivially mockable in unit tests.
     */
    interface BridgeHandler {
        fun runOnUi(block: () -> Unit)
        fun onPrint()
        fun onPushSubscribe(messageJson: String)
        fun onPushPermissionRequest()
        fun onPushPermissionState()
        fun onPushToken()
    }

    companion object {
        const val NAME = "AntAlmanacBridge"
    }
}

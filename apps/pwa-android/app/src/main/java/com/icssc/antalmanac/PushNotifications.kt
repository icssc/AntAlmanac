package com.icssc.antalmanac

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import android.webkit.WebView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject

/**
 * Push-notification bridge. Direct port of
 * apps/pwa/src/AntAlmanac/PushNotifications.swift, adapted to Android's:
 *
 *   - Runtime permission for POST_NOTIFICATIONS on API 33+ (iOS has the
 *     equivalent UNUserNotificationCenter call).
 *   - FCM topic subscribe/unsubscribe (FirebaseMessaging.getInstance()).
 *   - Token retrieval (FirebaseMessaging.getInstance().token).
 *
 * Firebase calls are stubbed with reflection-style lookups so the wrapper
 * compiles before `google-services.json` is provisioned. Once Firebase is
 * pulled in (uncomment the dependency in build.gradle.kts), replace the
 * stubs with direct `FirebaseMessaging` calls.
 */
class PushNotifications(
    private val activity: Activity,
    private val webView: () -> WebView?,
) {
    /**
     * Mirrors PushNotifications.swift `handlePushPermission()`.
     *
     * On Android <13 notifications are always granted at install time, so we
     * just dispatch `granted` straight back. On Android 13+ we use the
     * regular runtime permission API; the result lands in
     * [onRequestPermissionsResult] which calls [emitPermissionResult].
     */
    fun handlePermissionRequest() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            emitPermissionResult(true)
            return
        }

        val granted = ContextCompat.checkSelfPermission(
            activity,
            Manifest.permission.POST_NOTIFICATIONS,
        ) == PackageManager.PERMISSION_GRANTED

        if (granted) {
            emitPermissionResult(true)
            return
        }

        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            PERMISSION_REQUEST_CODE,
        )
    }

    /** Called from [MainActivity.onRequestPermissionsResult]. */
    fun onRequestPermissionsResult(requestCode: Int, grantResults: IntArray) {
        if (requestCode != PERMISSION_REQUEST_CODE) return
        val granted = grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED
        emitPermissionResult(granted)
    }

    /** Mirrors PushNotifications.swift `handlePushState()`. */
    fun handlePermissionState() {
        val state = when {
            Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU -> "authorized"
            ContextCompat.checkSelfPermission(
                activity,
                Manifest.permission.POST_NOTIFICATIONS,
            ) == PackageManager.PERMISSION_GRANTED -> "authorized"
            ActivityCompat.shouldShowRequestPermissionRationale(
                activity,
                Manifest.permission.POST_NOTIFICATIONS,
            ) -> "denied"
            else -> "notDetermined"
        }
        dispatch("push-permission-state", "'$state'")
    }

    /** Mirrors PushNotifications.swift `handleSubscribeTouch()`. */
    fun handleSubscribe(messageJson: String) {
        val parsed = runCatching { JSONObject(messageJson) }.getOrNull() ?: return
        val topic = parsed.optString("topic").ifEmpty { return }
        val unsubscribe = parsed.optBoolean("unsubscribe", false)

        // Placeholder until firebase-messaging is on the classpath. Once
        // wired up, replace with:
        //
        //   val messaging = com.google.firebase.messaging.FirebaseMessaging.getInstance()
        //   if (unsubscribe) messaging.unsubscribeFromTopic(topic)
        //   else messaging.subscribeToTopic(topic)
        Log.d(TAG, "FCM topic ${if (unsubscribe) "unsubscribe" else "subscribe"}: $topic")
    }

    /** Mirrors PushNotifications.swift `handleFCMToken()`. */
    fun handleToken() {
        // Placeholder. Replace with:
        //
        //   FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
        //       if (!task.isSuccessful) {
        //           dispatch("push-token", "'ERROR GET TOKEN'")
        //           return@addOnCompleteListener
        //       }
        //       dispatch("push-token", "'${task.result}'")
        //   }
        Log.d(TAG, "FCM token requested but Firebase is not yet wired up")
        dispatch("push-token", "'ERROR GET TOKEN'")
    }

    /**
     * Dispatch a CustomEvent in the WebView matching the contract iOS uses
     * in `returnPermissionResult` / `checkViewAndEvaluate`. `detail` is
     * embedded as a literal — callers pass either a quoted string or a JSON
     * blob.
     */
    private fun dispatch(event: String, detail: String) {
        val js = "window.dispatchEvent(new CustomEvent('$event', { detail: $detail }))"
        webView()?.post { webView()?.evaluateJavascript(js, null) }
    }

    private fun emitPermissionResult(granted: Boolean) {
        val detail = if (granted) "'granted'" else "'denied'"
        dispatch("push-permission-request", detail)
    }

    /**
     * Static helpers for the background path (FCM message arrival). Called
     * from [AntAlmanacMessagingService] to push notifications into the
     * WebView when the app happens to be foregrounded.
     */
    companion object {
        private const val TAG = "PushNotifications"
        const val PERMISSION_REQUEST_CODE = 4242

        fun sendPushToWebView(webView: WebView?, payload: Map<String, String>) {
            val json = JSONObject(payload as Map<*, *>).toString()
            webView?.post {
                webView.evaluateJavascript(
                    "window.dispatchEvent(new CustomEvent('push-notification', { detail: $json }))",
                    null,
                )
            }
        }

        fun sendPushClickToWebView(webView: WebView?, payload: Map<String, String>) {
            val json = JSONObject(payload as Map<*, *>).toString()
            webView?.post {
                webView.evaluateJavascript(
                    "window.dispatchEvent(new CustomEvent('push-notification-click', { detail: $json }))",
                    null,
                )
            }
        }
    }
}

package com.icssc.antalmanac

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

/**
 * Background FCM receiver. Sibling of the
 * UNUserNotificationCenterDelegate / MessagingDelegate extensions of
 * AppDelegate.swift.
 *
 * The class itself is intentionally lean: it's left disabled in the manifest
 * (`android:enabled="false"`) and present so that flipping the flag + adding
 * the firebase-messaging dependency is the only step needed to light up push.
 *
 * Once Firebase is on the classpath, change the parent to
 * `FirebaseMessagingService` and override:
 *
 *   override fun onMessageReceived(message: RemoteMessage) { ... }
 *   override fun onNewToken(token: String) { ... }
 *
 * The implementation below treats those overrides as the entry points and
 * delegates to helpers that don't depend on the Firebase types, so the body
 * stays compile-clean.
 */
class AntAlmanacMessagingService : android.app.Service() {

    override fun onBind(intent: Intent?) = null

    /** Stand-in for `FirebaseMessagingService.onMessageReceived`. */
    fun handleMessage(data: Map<String, String>, title: String?, body: String?) {
        Log.d(TAG, "FCM payload: $data")

        val notification = NotificationCompat.Builder(
            this,
            getString(R.string.default_notification_channel_id),
        )
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title ?: getString(R.string.app_name))
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(buildLaunchIntent(data))
            .build()

        if (NotificationManagerCompat.from(this).areNotificationsEnabled()) {
            try {
                NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, notification)
            } catch (security: SecurityException) {
                // POST_NOTIFICATIONS denied on Android 13+. The bridge has
                // already informed the web app of the permission state, so
                // dropping the notification silently matches iOS behaviour
                // when authorizationStatus == .denied.
                Log.w(TAG, "Notification posting denied", security)
            }
        }
    }

    /**
     * Pending intent that re-opens AntAlmanac when the user taps the
     * notification. Mirrors the `userNotificationCenter(_,didReceive:_)`
     * handler in AppDelegate.swift which routes the payload back to the web
     * app via `sendPushClickToWebView`.
     */
    private fun buildLaunchIntent(data: Map<String, String>): PendingIntent {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(EXTRA_PUSH_PAYLOAD, HashMap(data))
        }
        return PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }

    companion object {
        private const val TAG = "AntAlmanacFCM"
        private const val NOTIFICATION_ID = 1
        const val EXTRA_PUSH_PAYLOAD = "com.icssc.antalmanac.PUSH_PAYLOAD"
    }
}

/**
 * Tiny helper so [MainActivity] doesn't need to know about
 * [NotificationManager] internals — used when the activity is launched via
 * a notification tap and wants to forward the payload into the WebView.
 */
fun Context.extractPushPayload(intent: Intent?): Map<String, String>? {
    if (intent == null) return null
    @Suppress("UNCHECKED_CAST")
    return intent.getSerializableExtra(AntAlmanacMessagingService.EXTRA_PUSH_PAYLOAD)
        as? HashMap<String, String>
}

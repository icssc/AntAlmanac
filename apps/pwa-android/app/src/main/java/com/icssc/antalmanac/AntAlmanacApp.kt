package com.icssc.antalmanac

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

/**
 * Application class. Direct counterpart of `AppDelegate.swift`.
 *
 * The iOS AppDelegate handles three things:
 *   1. Firebase setup (FirebaseApp.configure + Messaging delegate)
 *   2. Notification permission registration
 *   3. Foreground / background push delivery into the WebView
 *
 * On Android (1) is automatic via the `google-services` plugin + manifest
 * `MessagingService`. (2) is now a runtime permission requested on first
 * launch inside [MainActivity]. (3) is split between
 * [AntAlmanacMessagingService] (background) and a `JsBridge` event dispatch
 * (foreground). This class is responsible only for the one piece neither of
 * those handles: pre-creating the default notification channel before the
 * first notification arrives.
 *
 * Channels are an Android 8+ concept with no iOS analogue: notifications
 * without a registered channel are silently dropped, so this has to run
 * before FCM can deliver anything.
 */
class AntAlmanacApp : Application() {

    override fun onCreate() {
        super.onCreate()
        createDefaultNotificationChannel()
    }

    private fun createDefaultNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val channel = NotificationChannel(
            getString(R.string.default_notification_channel_id),
            getString(R.string.default_notification_channel_name),
            NotificationManager.IMPORTANCE_DEFAULT,
        ).apply {
            description = getString(R.string.default_notification_channel_description)
        }

        getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }
}

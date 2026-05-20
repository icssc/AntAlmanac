package com.icssc.antalmanac;

/**
 * Notification + share-target delegation. The default superclass
 * implementation handles both:
 *
 *   - `Notification.showNotification` calls from the PWA's Service Worker
 *     are forwarded over the TWA IPC and posted via Android's
 *     NotificationManager (using @drawable/ic_notification_icon from the
 *     manifest meta-data).
 *
 *   - Web Share Target POSTs land here and are re-routed to the TWA's
 *     Custom Tab via FileProvider URIs.
 *
 * Like LauncherActivity, this is Bubblewrap-generated boilerplate — we
 * subclass only to give the manifest a concrete class name in the
 * `com.icssc.antalmanac` package.
 */
public class DelegationService
    extends com.google.androidbrowserhelper.trusted.DelegationService {
}

// Top-level build file. Mirrors the multi-module layout of the iOS Xcode
// project (apps/pwa/src/AntAlmanac.xcodeproj). All actual configuration lives
// in app/build.gradle.kts — this file just declares the plugin versions used
// across modules.

plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
    // Google Services plugin is required if FCM (PushNotifications.kt) is
    // enabled. Apply via `apply true` in app/build.gradle.kts once a
    // google-services.json is committed.
    id("com.google.gms.google-services") version "4.4.2" apply false
}

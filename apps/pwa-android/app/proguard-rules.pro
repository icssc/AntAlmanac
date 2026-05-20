# JavaScript interface methods invoked from the WebView via @JavascriptInterface
# would otherwise be stripped by R8 in release builds, breaking the push
# notification + print bridges. Mirrors the @objc / WKScriptMessageHandler
# surface on iOS (PushNotifications.swift).
-keepclassmembers class com.icssc.antalmanac.JsBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep the entry points referenced from AndroidManifest.xml even if R8 thinks
# they're unused. (Android already does this for activities, but Firebase
# services often slip past without help.)
-keep class com.icssc.antalmanac.AntAlmanacMessagingService { *; }

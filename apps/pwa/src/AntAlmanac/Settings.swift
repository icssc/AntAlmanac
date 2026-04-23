import WebKit

struct Cookie {
    var name: String
    var value: String
}

let gcmMessageIDKey = "00000000000" // update this with actual ID if using Firebase 

// URL for first launch
let rootUrl = URL(string: "https://antalmanac.com")!

// allowed origin is for what we are sticking to pwa domain
// This should also appear in Info.plist
let allowedOrigins: [String] = ["antalmanac.com"]

// Hosts whose top-level navigations get handed off to ASWebAuthenticationSession
// instead of loading inside the WKWebView. Only the FIRST outbound redirect
// matters here; everything downstream (e.g. accounts.google.com, myaccount.google.com,
// shib.service.uci.edu, duosecurity.com, Google session-sync hops) happens inside
// the Safari-backed ASW session and never reaches WKNavigationDelegate, so those
// hosts don't need to be listed.
let authOrigins: [String] = ["auth.icssc.club"]

let platformCookie = Cookie(name: "app-platform", value: "iOS App Store")

// UI options
let displayMode = "standalone" // standalone / fullscreen.
let adaptiveUIStyle = true     // iOS 15+ only. Change app theme on the fly to dark/light related to WebView background color.
let overrideStatusBar = false   // iOS 13-14 only. if you don't support dark/light system theme.
let statusBarTheme = "dark"    // dark / light, related to override option.
let pullToRefresh = true    // Enable/disable pull down to refresh page

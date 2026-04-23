import UIKit
import WebKit
import AuthenticationServices

var webView: WKWebView! = nil

class ViewController: UIViewController, WKNavigationDelegate, UIDocumentInteractionControllerDelegate {
    enum LoadingMode {
        case defaultCachePolicy
        case forceCache
    }

    var documentController: UIDocumentInteractionController?
    func documentInteractionControllerViewControllerForPreview(_ controller: UIDocumentInteractionController) -> UIViewController {
        return self
    }
    
    @IBOutlet weak var loadingView: UIView!
    @IBOutlet weak var progressView: UIProgressView!
    @IBOutlet weak var connectionProblemView: UIImageView!
    @IBOutlet weak var webviewView: UIView!

    // Held strongly so ARC doesn't drop the session mid-flow (iOS < 13 guidance,
    // retained here as defensive; also makes the lifecycle obvious).
    var currentAuthSession: ASWebAuthenticationSession?
    
    var htmlIsLoaded = false;
    private var loadingMode = LoadingMode.defaultCachePolicy
    
    private var themeObservation: NSKeyValueObservation?
    var currentWebViewTheme: UIUserInterfaceStyle = .unspecified
    override var preferredStatusBarStyle : UIStatusBarStyle {
        if #available(iOS 13, *), overrideStatusBar{
            if #available(iOS 15, *) {
                return .default
            } else {
                return statusBarTheme == "dark" ? .lightContent : .darkContent
            }
        }
        return .default
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        initWebView()
        loadRootUrl()
    
        NotificationCenter.default.addObserver(self, selector: #selector(self.keyboardWillHide(_:)), name: UIResponder.keyboardWillHideNotification , object: nil)
        
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        AntAlmanac.webView.frame = calcWebviewFrame(webviewView: webviewView, toolbarView: nil)
    }
    
    @objc func keyboardWillHide(_ notification: NSNotification) {
        AntAlmanac.webView.setNeedsLayout()
    }
    
    func initWebView() {
        AntAlmanac.webView = createWebView(container: webviewView, WKSMH: self, WKND: self, NSO: self, VC: self)
        webviewView.addSubview(AntAlmanac.webView);
        
        AntAlmanac.webView.uiDelegate = self;
        
        AntAlmanac.webView.addObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress), options: .new, context: nil)

        if(pullToRefresh){
            let refreshControl = UIRefreshControl()
            refreshControl.addTarget(self, action: #selector(refreshWebView(_:)), for: UIControl.Event.valueChanged)
            AntAlmanac.webView.scrollView.addSubview(refreshControl)
            AntAlmanac.webView.scrollView.bounces = true
        }

        if #available(iOS 15.0, *), adaptiveUIStyle {
            themeObservation = AntAlmanac.webView.observe(\.themeColor) { [unowned self] webView, _ in
                let backgroundColor = AntAlmanac.webView.underPageBackgroundColor;
                let themeColor = AntAlmanac.webView.themeColor;
                currentWebViewTheme = themeColor?.isLight() ?? backgroundColor?.isLight() ?? true ? .light : .dark
                self.overrideUIStyle()
                view.backgroundColor = themeColor ?? backgroundColor;
            }
        }
    }

    @objc func refreshWebView(_ sender: UIRefreshControl) {
        AntAlmanac.webView?.reload()
        sender.endRefreshing()
    }

    func overrideUIStyle(toDefault: Bool = false) {
        if #available(iOS 15.0, *), adaptiveUIStyle {
            if (((htmlIsLoaded && !AntAlmanac.webView.isHidden) || toDefault) && self.currentWebViewTheme != .unspecified) {
                UIApplication
                    .shared
                    .connectedScenes
                    .flatMap { ($0 as? UIWindowScene)?.windows ?? [] }
                    .first { $0.isKeyWindow }?.overrideUserInterfaceStyle = toDefault ? .unspecified : self.currentWebViewTheme;
            }
        }
    }
    
    @objc func loadRootUrl(cachePolicy: NSURLRequest.CachePolicy = .useProtocolCachePolicy) {
        AntAlmanac.webView.load(URLRequest(url: SceneDelegate.universalLinkToLaunch ?? SceneDelegate.shortcutLinkToLaunch ?? rootUrl, cachePolicy: cachePolicy))
    }
    
    func reloadWebview(
        loadingMode: LoadingMode = LoadingMode.defaultCachePolicy
    ) {
        switch loadingMode {
        case LoadingMode.defaultCachePolicy:
            loadRootUrl(cachePolicy: .useProtocolCachePolicy);

        case LoadingMode.forceCache:
            loadRootUrl(cachePolicy: .useProtocolCachePolicy);
        }

        self.loadingMode = loadingMode
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!){
        htmlIsLoaded = true
        
        self.setProgress(1.0, true)
        self.animateConnectionProblem(false)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            AntAlmanac.webView.isHidden = false
            self.loadingView.isHidden = true
           
            self.setProgress(0.0, false)
            
            self.overrideUIStyle()
        }
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        htmlIsLoaded = false;
        
        if (error as NSError)._code == (-999) { return }
        
        self.overrideUIStyle(toDefault: true);
        webView.isHidden = true;
        loadingView.isHidden = false;

        if loadingMode == LoadingMode.defaultCachePolicy {
            DispatchQueue.main.async {
                self.reloadWebview(loadingMode: LoadingMode.forceCache)
            }
        } else {
            animateConnectionProblem(true);
            setProgress(0.05, true);
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                self.setProgress(0.1, true);
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    self.reloadWebview()
                }
            }
        }
    }
    
    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {

        if (keyPath == #keyPath(WKWebView.estimatedProgress) &&
                AntAlmanac.webView.isLoading &&
                !self.loadingView.isHidden &&
                !self.htmlIsLoaded) {
                    var progress = Float(AntAlmanac.webView.estimatedProgress);
                    
                    if (progress >= 0.8) { progress = 1.0; };
                    if (progress >= 0.3) { self.animateConnectionProblem(false); }
                    
                    self.setProgress(progress, true);
        }
    }
    
    func setProgress(_ progress: Float, _ animated: Bool) {
        self.progressView.setProgress(progress, animated: animated);
    }
    
    
    func animateConnectionProblem(_ show: Bool) {
        if (show) {
            self.connectionProblemView.isHidden = false;
            self.connectionProblemView.alpha = 0
            UIView.animate(withDuration: 0.7, delay: 0, options: [.repeat, .autoreverse], animations: {
                self.connectionProblemView.alpha = 1
            })
        }
        else {
            UIView.animate(withDuration: 0.3, delay: 0, options: [], animations: {
                self.connectionProblemView.alpha = 0 // Here you will get the animation you want
            }, completion: { _ in
                self.connectionProblemView.isHidden = true;
                self.connectionProblemView.layer.removeAllAnimations();
            })
        }
    }
        
    deinit {
        AntAlmanac.webView.removeObserver(self, forKeyPath: #keyPath(WKWebView.estimatedProgress))
    }
}

extension UIColor {
    // Check if the color is light or dark, as defined by the injected lightness threshold.
    // Some people report that 0.7 is best. I suggest to find out for yourself.
    // A nil value is returned if the lightness couldn't be determined.
    func isLight(threshold: Float = 0.5) -> Bool? {
        let originalCGColor = self.cgColor

        // Now we need to convert it to the RGB colorspace. UIColor.white / UIColor.black are greyscale and not RGB.
        // If you don't do this then you will crash when accessing components index 2 below when evaluating greyscale colors.
        let RGBCGColor = originalCGColor.converted(to: CGColorSpaceCreateDeviceRGB(), intent: .defaultIntent, options: nil)
        guard let components = RGBCGColor?.components else {
            return nil
        }
        guard components.count >= 3 else {
            return nil
        }

        let brightness = Float(((components[0] * 299) + (components[1] * 587) + (components[2] * 114)) / 1000)
        return (brightness > threshold)
    }
}

extension ViewController: WKScriptMessageHandler {
  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "print" {
            printView(webView: AntAlmanac.webView)
        }
        if message.name == "push-subscribe" {
            handleSubscribeTouch(message: message)
        }
        if message.name == "push-permission-request" {
            handlePushPermission()
        }
        if message.name == "push-permission-state" {
            handlePushState()
        }
        if message.name == "push-token" {
            handleFCMToken()
        }
  }
}

// MARK: - ASWebAuthenticationSession handoff
//
// When the WKWebView tries to navigate to auth.icssc.club (the ICSSC OIDC
// issuer), we cancel the navigation and re-run the flow inside an
// ASWebAuthenticationSession. Reasons:
//   1. Google rejects OAuth inside embedded webviews with `disallowed_useragent`
//      since 2021-09-30 (Google Developers Blog).
//   2. Passkeys / WebAuthn bound to a third-party RP ID (e.g. google.com) only
//      work in top-level Safari context, not in a WKWebView owned by our app
//      (passkeys.dev, Apple docs on passkey use in web browsers).
//
// The callback uses a Universal Link (`https://antalmanac.com/auth/native`)
// instead of a custom URL scheme. Apple's iOS 17.4+ ASWebAuthenticationSession
// HTTPS-callback initializer matches the callback via the AASA file served at
// `https://antalmanac.com/.well-known/apple-app-site-association`, so the
// callback can only be delivered to our AASA-verified app binary. A malicious
// app registering a lookalike custom URL scheme cannot intercept it, and
// cannot initiate an OAuth flow that redirects to our app (the system would
// route the Universal Link to the real AntAlmanac, which has no matching
// PKCE code_verifier cookie and would reject the exchange).
//
// On callback, we rewrite the URL path from /auth/native to /auth and load it
// in the WKWebView. The oauth_state / oauth_code_verifier / oauth_redirect_uri
// cookies set when the WKWebView originally called getGoogleAuthUrl are still
// present in the WKWebView's cookie jar, so AuthPage.tsx + the tRPC exchange
// work without any further native involvement.
extension ViewController: ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return view.window ?? ASPresentationAnchor()
    }

    func startAuthSession(url: URL, webView: WKWebView) {
        // Universal Link callback: only apps listed in the AASA file for
        // antalmanac.com can receive this URL. Must match the redirect URI
        // registered on auth.icssc.club for the AntAlmanac OAuth client and
        // the value of NATIVE_IOS_REDIRECT_URI in apps/antalmanac/src/lib/platform.ts.
        let callback: ASWebAuthenticationSession.Callback = .https(
            host: "antalmanac.com",
            path: "/auth/native"
        )

        let session = ASWebAuthenticationSession(
            url: url,
            callback: callback
        ) { [weak self, weak webView] callbackURL, error in
            self?.currentAuthSession = nil

            if let error = error {
                let nsError = error as NSError
                // User-cancelled is expected; ignore silently.
                if nsError.domain == ASWebAuthenticationSessionError.errorDomain &&
                    nsError.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                    return
                }
                print("ASWebAuthenticationSession error: \(error)")
                return
            }

            guard let callbackURL = callbackURL,
                  var components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false) else {
                return
            }

            // Rewrite /auth/native?... -> /auth?... so the existing AuthPage route
            // in the WKWebView picks up the exchange; /auth/native itself is only
            // a callback sink for ASW and doesn't need a rich web handler.
            components.path = "/auth"

            if let redirectURL = components.url {
                webView?.load(URLRequest(url: redirectURL))
            }
        }
        session.presentationContextProvider = self
        // Share Safari cookies + iCloud Keychain passkeys so Google SSO, UCI
        // Shib/Duo, and any cross-session credentials reuse cleanly.
        session.prefersEphemeralWebBrowserSession = false
        self.currentAuthSession = session
        session.start()
    }
}
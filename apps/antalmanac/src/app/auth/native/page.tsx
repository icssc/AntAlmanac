import { AuthPageClient } from '$src/app/auth/AuthPageClient';

/**
 * OAuth callback sink for the native iOS wrapper. In the happy path
 * ASWebAuthenticationSession intercepts this URL via the AASA association
 * and never actually loads it in any web view. This route exists as
 * defense-in-depth for when the URL is navigated to directly.
 */
export default function AuthNativePage() {
    return <AuthPageClient />;
}

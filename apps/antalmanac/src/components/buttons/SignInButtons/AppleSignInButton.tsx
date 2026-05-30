import { SignInButton } from '$components/buttons/SignInButtons/SignInButton';
import { Provider } from '$lib/auth/authTypes';
import { useThemeStore } from '$stores/SettingsStore';
import { Apple as AppleIcon } from '@mui/icons-material';

interface AppleSignInButtonProps {
    fullWidth?: boolean;
}

/**
 * Sign in with Apple button.
 *
 * Apple HIG defines three permitted styles: black, white, and white-outline.
 * No gray or colored combinations are allowed — hover states must stay within
 * the same black/white family as the resting state.
 *   https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
 *   https://developer.apple.com/documentation/authenticationservices/signinwithapplebutton/style
 *
 * Dark mode  → white style: #FFFFFF bg, #000000 text, #F5F5F5 on hover.
 * Light mode → black style: #000000 bg, #FFFFFF text, #1A1A1A on hover.
 */
export const AppleSignInButton = ({ fullWidth }: AppleSignInButtonProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <SignInButton
            icon={<AppleIcon />}
            provider={Provider.Apple}
            fullWidth={fullWidth}
            sx={{
                backgroundColor: isDark ? '#fff' : '#000',
                color: isDark ? '#000' : '#fff',
                '&:hover': {
                    backgroundColor: isDark ? '#f5f5f5' : '#1a1a1a',
                },
            }}
        />
    );
};

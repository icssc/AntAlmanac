import { useThemeStore } from '$stores/SettingsStore';
import { Apple as AppleIcon } from '@mui/icons-material';
import { Button } from '@mui/material';

interface AppleSignInButtonProps {
    onClick: () => void;
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
export const AppleSignInButton = ({ onClick, fullWidth }: AppleSignInButtonProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Button
            onClick={onClick}
            startIcon={<AppleIcon />}
            variant="contained"
            size="large"
            fullWidth={fullWidth}
            sx={{
                backgroundColor: isDark ? '#fff' : '#000',
                color: isDark ? '#000' : '#fff',
                '&:hover': {
                    backgroundColor: isDark ? '#f5f5f5' : '#1a1a1a',
                },
            }}
        >
            Sign in with Apple
        </Button>
    );
};

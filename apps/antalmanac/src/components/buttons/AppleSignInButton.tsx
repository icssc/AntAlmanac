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
 * Per Apple's Human Interface Guidelines, the button must use black text/logo
 * on a white background, or white text/logo on a black background — no other
 * color combinations are permitted.
 *   https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
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
                    backgroundColor: isDark ? '#e0e0e0' : '#333',
                },
            }}
        >
            Sign in with Apple
        </Button>
    );
};

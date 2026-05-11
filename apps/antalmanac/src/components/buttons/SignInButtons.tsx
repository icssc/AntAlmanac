import { useThemeStore } from '$stores/SettingsStore';
import { Apple as AppleIcon } from '@mui/icons-material';
import { Button, type SxProps, type Theme } from '@mui/material';

/**
 * Colored Google "G" logo per Google's branding guidelines.
 * Monochrome versions of the Google "G" are explicitly disallowed.
 * https://developers.google.com/identity/branding-guidelines
 */
const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        />
        <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        />
        <path
            fill="#FBBC05"
            d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        />
        <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        />
    </svg>
);

/**
 * Returns MUI sx overrides for the Apple sign-in button.
 * Exported so callers that need only the style object (not the full component) can use it.
 */
export const appleButtonSx = (isDark: boolean): SxProps<Theme> => ({
    backgroundColor: isDark ? '#fff' : '#000',
    color: isDark ? '#000' : '#fff',
    '&:hover': {
        backgroundColor: isDark ? '#e0e0e0' : '#333',
    },
});

/**
 * Returns MUI sx overrides for the Google sign-in button.
 * Light theme: white fill, #747775 stroke — Dark theme: #131314 fill, #8E918F stroke.
 * Matches Google's branding spec for custom buttons.
 */
export const googleButtonSx = (isDark: boolean): SxProps<Theme> => ({
    backgroundColor: isDark ? '#131314' : '#ffffff',
    color: isDark ? '#e3e3e3' : '#1f1f1f',
    border: `1px solid ${isDark ? '#8e918f' : '#747775'}`,
    fontFamily: 'Roboto, sans-serif',
    fontWeight: 500,
    boxShadow: 'none',
    '&:hover': {
        backgroundColor: isDark ? '#1e1e1f' : '#f2f2f2',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        border: `1px solid ${isDark ? '#8e918f' : '#747775'}`,
    },
});

interface SignInButtonProps {
    onClick: () => void;
    fullWidth?: boolean;
}

export const GoogleSignInButton = ({ onClick, fullWidth }: SignInButtonProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Button
            onClick={onClick}
            startIcon={<GoogleLogo />}
            variant="outlined"
            size="large"
            fullWidth={fullWidth}
            sx={googleButtonSx(isDark)}
        >
            Sign in with Google
        </Button>
    );
};

export const AppleSignInButton = ({ onClick, fullWidth }: SignInButtonProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Button
            onClick={onClick}
            startIcon={<AppleIcon />}
            variant="contained"
            size="large"
            fullWidth={fullWidth}
            sx={appleButtonSx(isDark)}
        >
            Sign in with Apple
        </Button>
    );
};

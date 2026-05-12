import { loginUser } from '$actions/AppStoreActions';
import { Provider } from '$lib/auth/authTypes';
import { getProviderDisplayName } from '$lib/auth/authUtils';
import { Button, SxProps } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { ComponentProps, ReactNode, useState } from 'react';

interface Props {
    icon: ReactNode;
    provider: Provider;
    fullWidth?: ComponentProps<typeof Button>['fullWidth'];
    sx?: SxProps;
}

export const SignInButton = ({ icon, provider, fullWidth, sx }: Props) => {
    const [isSigningIn, setIsSigningIn] = useState(false);

    const postHog = usePostHog();

    const handleClick = async () => {
        setIsSigningIn(true);
        await loginUser(provider, { postHog });
        setIsSigningIn(false);
    };

    return (
        <Button
            onClick={handleClick}
            startIcon={icon}
            color="primary"
            variant="contained"
            size="large"
            fullWidth={fullWidth}
            loading={isSigningIn}
            sx={sx}
        >
            Sign in with {getProviderDisplayName(provider)}
        </Button>
    );
};

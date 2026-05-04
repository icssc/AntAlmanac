import { loginUser } from '$actions/AppStoreActions';
import GoogleIcon from '@mui/icons-material/Google';
import { Button } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { ComponentProps, useState } from 'react';

interface Props {
    fullWidth?: ComponentProps<typeof Button>['fullWidth'];
}

const SignInButton = ({ fullWidth }: Props) => {
    const [isSigningIn, setIsSigningIn] = useState(false);

    const postHog = usePostHog();

    const handleClick = async () => {
        setIsSigningIn(true);
        await loginUser({ postHog });
        setIsSigningIn(false);
    };

    return (
        <Button
            onClick={handleClick}
            startIcon={<GoogleIcon />}
            color="primary"
            variant="contained"
            size="large"
            fullWidth={fullWidth}
            loading={isSigningIn}
        >
            Sign in with Google
        </Button>
    );
};
export default SignInButton;

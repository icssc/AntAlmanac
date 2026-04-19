import { loginUser } from '$actions/AppStoreActions';
import GoogleIcon from '@mui/icons-material/Google';
import { Button } from '@mui/material';
import { ComponentProps } from 'react';

interface Props {
    fullWidth?: ComponentProps<typeof Button>['fullWidth'];
}

const SignInButton = ({ fullWidth }: Props) => {
    return (
        <Button
            onClick={() => loginUser()}
            startIcon={<GoogleIcon />}
            color="primary"
            variant="contained"
            size="large"
            fullWidth={fullWidth}
        >
            Sign in with Google
        </Button>
    );
};
export default SignInButton;

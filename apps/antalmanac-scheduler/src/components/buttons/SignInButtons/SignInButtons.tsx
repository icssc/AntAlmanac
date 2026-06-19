import { AppleSignInButton } from '$components/buttons/SignInButtons/AppleSignInButton';
import { GoogleSignInButton } from '$components/buttons/SignInButtons/GoogleSignInButton';

export const SignInButtons = () => {
    return (
        <>
            <GoogleSignInButton fullWidth />
            <AppleSignInButton fullWidth />
        </>
    );
};

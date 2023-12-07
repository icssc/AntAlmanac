import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react';
import trpc from '$lib/api/trpc';

export function Login() {
    const mutation = trpc.auth.check.useMutation();

    const onSuccess = useCallback((credentialResponse: CredentialResponse) => {
        console.log(credentialResponse);

        document.cookie = `access_token=${credentialResponse.credential}; path=/`;

        mutation.mutate();
    }, []);

    const onError = useCallback(() => {
        console.log('Login Failed');
    }, []);

    return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
}

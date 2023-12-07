import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react';
import trpc from '$lib/api/trpc';

export function Login() {
    const onSuccess = useCallback((credentialResponse: CredentialResponse) => {
        console.log(credentialResponse);
    }, []);

    const onError = useCallback(() => {
        console.log('Login Failed');
    }, []);

    return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
}

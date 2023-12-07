import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react';
import trpc from '$lib/api/trpc';

export function Login() {
    const utils = trpc.useUtils();

    const query = trpc.auth.status.useQuery();

    const onSuccess = useCallback((credentialResponse: CredentialResponse) => {
        console.log(credentialResponse);

        document.cookie = `access_token=${credentialResponse.credential}; path=/`;

        utils.auth.invalidate();
    }, []);

    const onError = useCallback(() => {
        console.log('Login Failed');
    }, []);

    return query.data?.email ? <div>LOGGED IN</div> : <GoogleLogin onSuccess={onSuccess} onError={onError} />;
}

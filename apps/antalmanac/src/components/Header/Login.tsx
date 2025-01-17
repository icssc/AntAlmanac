import { Button } from '@material-ui/core';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import trpc from '$lib/api/trpc';

function Login() {
    const [searchParams] = useSearchParams();

    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        trpc.users.getGoogleAuthUrl
            .query()
            .then(setUrl)
            .then(() => {
                const code = searchParams.get('code');
                // const state = searchParams.get('state');
                // console.log(code);
                trpc.users.handleGoogleCallback.query({ code: code || '' });
            });
    }, []);

    return (
        <Button
            onClick={() => {
                if (url) window.location.href = url;
            }}
            startIcon={<AccountCircleIcon />}
            color="inherit"
        >
            Login
        </Button>
    );
}

export default Login;

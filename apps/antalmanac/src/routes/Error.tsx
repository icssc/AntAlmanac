import { Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export const Error = () => (
    <Stack
        spacing={3}
        sx={{
            padding: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            height: '100vh',
            textAlign: 'center',
        }}
    >
        <Typography variant="h3" component="h1">
            Oops! Something went wrong.
        </Typography>
        <Stack spacing={2} sx={{ paddingY: '1rem' }}>
            <Typography variant="h5" component="p">
                This error may be caused by your browser having an out of date version of AntAlmanac.
            </Typography>
            <Typography variant="h5" component="p">
                Try refreshing the page. If the error persists, please submit a{' '}
                <Link to="https://forms.gle/k81f2aNdpdQYeKK8A">bug report</Link>
            </Typography>
        </Stack>
        <Link to="/">
            <Button variant="contained" size="large">
                Back to Home
            </Button>
        </Link>
    </Stack>
);

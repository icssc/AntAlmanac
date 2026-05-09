import { Box, Typography, Button, Stack } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
    return (
        <Box sx={{ height: '100dvh', overflowY: 'auto' }}>
            <Stack
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    maxWidth: 800,
                    minHeight: '100dvh',
                    margin: 'auto',
                    padding: 2,
                    gap: 2,
                }}
            >
                <Typography variant="h3" component="h1">
                    Page Not Found
                </Typography>
                <Typography variant="h5" component="p">
                    The page you&apos;re looking for doesn&apos;t exist.
                </Typography>
                <Link href="/">
                    <Button variant="contained" size="large">
                        Back to Home
                    </Button>
                </Link>
            </Stack>
        </Box>
    );
}

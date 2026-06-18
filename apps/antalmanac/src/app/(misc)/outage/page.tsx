'use client';

import { Box, Typography, Stack } from '@mui/material';
import Link from 'next/link';

export default function Page() {
    return (
        <Box sx={{ height: '100dvh', overflowY: 'auto' }}>
            <Stack
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    maxWidth: 800,
                    minHeight: '100dvh',
                    margin: 'auto',
                    padding: 2,
                    gap: 2,
                }}
            >
                <Typography variant="h3" component="h1" sx={{ textWrap: 'balance' }}>
                    AntAlmanac is currently down for maintenance.
                </Typography>
                <Stack spacing={2}>
                    <Typography variant="h5" component="p" sx={{ textWrap: 'balance' }}>
                        We apologize for the inconvenience and are working to get AntAlmanac back on online. Check out
                        the{' '}
                        <Link href="https://discord.gg/KqJq8huuBB" target="_blank" rel="noopener noreferrer">
                            ICSSC Projects server
                        </Link>{' '}
                        for updates.
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}

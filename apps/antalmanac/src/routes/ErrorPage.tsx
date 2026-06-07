'use client';

import { ExpandMore } from '@mui/icons-material';
import { Box, Accordion, AccordionDetails, AccordionSummary, Typography, Button, Stack } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
    const pathname = usePathname();

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
                <Typography variant="h3" component="h1">
                    Oops! Something went wrong.
                </Typography>
                <Stack spacing={2}>
                    <Typography variant="h5" component="p">
                        This error may be caused by your browser having an out of date version of AntAlmanac.
                    </Typography>
                    <Typography variant="h5" component="p">
                        Try refreshing the page. If the error persists, please submit a{' '}
                        <a href="https://forms.gle/k81f2aNdpdQYeKK8A">bug report</a> with the provided error.
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="outlined" size="large" onClick={reset}>
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="contained" size="large">
                            Back to Home
                        </Button>
                    </Link>
                </Stack>
                <Accordion defaultExpanded disableGutters sx={{ maxWidth: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography component="p">View Error Message</Typography>
                    </AccordionSummary>
                    <AccordionDetails
                        sx={{
                            display: 'flex',
                            gap: 1,
                            textAlign: 'left',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Typography sx={{ fontWeight: '600' }}>Route: {pathname}</Typography>
                        <Typography sx={{ wordBreak: 'break-word' }}>{error.stack ?? error.message}</Typography>
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Box>
    );
}

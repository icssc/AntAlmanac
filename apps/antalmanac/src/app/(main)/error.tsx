'use client';

import { ExpandMore } from '@mui/icons-material';
import { Box, Accordion, AccordionDetails, AccordionSummary, Typography, Button, Stack } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Error({ error }: { error: Error & { digest?: string } }) {
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
                        <Link href="/feedback">bug report</Link> with the provided error.
                    </Typography>
                </Stack>
                <Link href="/">
                    <Button variant="contained" size="large">
                        Back to Home
                    </Button>
                </Link>
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
                        <Typography sx={{ wordBreak: 'break-word' }}>
                            {error.stack ?? 'No error stack provided.'}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Box>
    );
}

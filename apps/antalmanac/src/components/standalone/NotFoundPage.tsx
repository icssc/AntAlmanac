'use client';

import { ExpandMore } from '@mui/icons-material';
import { Box, Accordion, AccordionDetails, AccordionSummary, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NotFoundPage() {
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
                    Page not found
                </Typography>
                <Typography variant="h5" component="p">
                    We couldn&apos;t find a page at <strong>{pathname}</strong>.
                </Typography>
                <Link href="/">
                    <Button variant="contained" size="large">
                        Back to Home
                    </Button>
                </Link>
                <Accordion disableGutters sx={{ maxWidth: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography component="p">Looking for something else?</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ textAlign: 'left' }}>
                        <Typography>
                            Try the{' '}
                            <Link href="/" style={{ textDecoration: 'underline' }}>
                                schedule planner
                            </Link>{' '}
                            or{' '}
                            <Link href="/feedback" style={{ textDecoration: 'underline' }}>
                                send feedback
                            </Link>
                            .
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Stack>
        </Box>
    );
}

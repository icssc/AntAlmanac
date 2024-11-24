import { ExpandMore } from '@mui/icons-material';
import { Box, Accordion, AccordionDetails, AccordionSummary, Typography, Button, Stack } from '@mui/material';
import { Link, useLocation, useRouteError } from 'react-router-dom';

export const ErrorPage = () => {
    const error = useRouteError();
    const location = useLocation();

    return (
        <Box sx={{ height: '100dvh', overflowY: 'scroll' }}>
            <Stack
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    maxWidth: 800,
                    minHeight: '100dvh',
                    margin: 'auto',
                }}
            >
                <Stack sx={{ maxHeight: '100dvh', gap: 2, height: 'fit-content', padding: 2 }}>
                    <Typography variant="h3" component="h1">
                        Oops! Something went wrong.
                    </Typography>
                    <Stack spacing={2}>
                        <Typography variant="h5" component="p">
                            This error may be caused by your browser having an out of date version of AntAlmanac.
                        </Typography>
                        <Typography variant="h5" component="p">
                            Try refreshing the page. If the error persists, please submit a{' '}
                            <Link to="https://forms.gle/k81f2aNdpdQYeKK8A">bug report</Link> with the provided error.
                        </Typography>
                    </Stack>
                    <Link to="/">
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
                            <Typography sx={{ fontWeight: '600' }}>Route: {location.pathname}</Typography>
                            <Typography sx={{ wordBreak: 'break-word' }}>
                                {error instanceof Error ? error.stack : 'No error stack provided.'}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Stack>
            </Stack>
        </Box>
    );
};

import { Close, OpenInNew } from '@mui/icons-material';
import { Paper, Typography, Box, IconButton, Button, Stack, useTheme } from '@mui/material';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { setLocalStorageHelpBoxDismissalTime } from '$lib/localStorage';
import { useHelpMenuStore } from '$stores/HelpMenuStore';

const images = [
    {
        src: '/roadmap.png',
        alt: 'PeterPortal Roadmap Page',
    },
    {
        src: '/professors.png',
        alt: 'PeterPortal Professors Page',
    },
];

export function HelpBox() {
    const theme = useTheme();
    const [showHelpBox, setShowHelpBox] = useHelpMenuStore(
        useShallow((store) => [store.showHelpBox, store.setShowHelpBox])
    );

    const dismissHelpBox = useCallback(() => {
        setLocalStorageHelpBoxDismissalTime(Date.now().toString());
    }, []);

    const handleClick = useCallback(() => {
        setShowHelpBox(false);
        dismissHelpBox();
    }, [dismissHelpBox, setShowHelpBox]);

    if (!showHelpBox) {
        return null;
    }

    return (
        <Paper variant="outlined" sx={{ padding: 2, marginBottom: '10px', marginRight: '5px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Need help planning your schedule?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Check out <b>PeterPortal</b>, a web application designed to aid UCI students with course
                        discovery and planning.
                    </Typography>
                </Box>
                <IconButton aria-label="close" size="small" onClick={handleClick} sx={{ color: 'text.disabled' }}>
                    <Close fontSize="inherit" />
                </IconButton>
            </Box>

            <Stack direction="row" spacing={2} sx={{ my: 2, justifyContent: 'center' }}>
                {images.map((image) => (
                    <Box
                        key={image.src}
                        component="img"
                        src={image.src}
                        alt={image.alt}
                        sx={{
                            width: '48%',
                            height: 'auto',
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.grey[300]}`,
                            boxShadow: theme.shadows[1],
                            objectFit: 'cover',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.02)',
                            },
                        }}
                    />
                ))}
            </Stack>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<OpenInNew />}
                    href="https://peterportal.org"
                    target="_blank"
                    fullWidth
                >
                    Visit PeterPortal
                </Button>
            </Box>
        </Paper>
    );
}

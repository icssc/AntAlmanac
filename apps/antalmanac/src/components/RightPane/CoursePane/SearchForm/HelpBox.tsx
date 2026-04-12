import { Close } from '@mui/icons-material';
import { Paper, Typography, Link, Box, IconButton } from '@mui/material';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { setLocalStorageHelpBoxDismissalTime } from '$lib/localStorage';
import { useHelpMenuStore } from '$stores/HelpMenuStore';

export function HelpBox() {
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
        <Paper variant="outlined" sx={{ padding: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Want to help build AntAlmanac?
                </Typography>
                <IconButton aria-label="close" size="large" color="inherit" onClick={handleClick}>
                    <Close fontSize="inherit" />
                </IconButton>
            </Box>

            <Typography variant="body2">
                We have opportunities for developers and designers of all skill levels.{' '}
                <Link href="https://www.icssc.club/projects" target="_blank" rel="noopener noreferrer">
                    Learn more about our projects!
                </Link>
            </Typography>
        </Paper>
    );
}

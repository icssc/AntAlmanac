import { Button, Paper, Popover, Tooltip } from '@mui/material';
import { IosShare } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import AppStore from '$stores/AppStore';
import ExportCalendar from '$components/buttons/ExportCalendar';
import ScreenshotButton from '$components/buttons/Screenshot';

function Export() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    return (
        <>
            <Tooltip title="Export your calendar">
                <Button onClick={handleClick} color="inherit" startIcon={<IosShare />} disabled={skeletonMode}>
                    Export
                </Button>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Paper
                    sx={{
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                    }}
                >
                    <ExportCalendar />
                    <ScreenshotButton />
                </Paper>
            </Popover>
        </>
    );
}

export default Export;

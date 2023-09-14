import { Button, Paper, Popover, Tooltip } from '@mui/material';
import { IosShare } from '@mui/icons-material';
import { useCallback, useMemo, useState } from 'react';

import ExportCalendar from '$components/AppBar/Exports/ExportCalendar';
import ScreenshotButton from '$components/AppBar/Exports/ScreenshotButton';

function Export() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

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
                <Button onClick={handleClick} color="inherit" startIcon={<IosShare />}>
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

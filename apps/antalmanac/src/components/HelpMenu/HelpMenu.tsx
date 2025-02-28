import { Lightbulb, Print, Share } from '@mui/icons-material';
import { Backdrop, Box, SpeedDial, SpeedDialAction, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

import { FeedbackAction } from '$components/HelpMenu/actions/FeedbackAction';
import { HelpBoxAction } from '$components/HelpMenu/actions/HelpBoxAction';

export function HelpMenu() {
    const [open, setOpen] = useState(false);

    const actions = [
        HelpBoxAction(),
        FeedbackAction(),
        { icon: <Print />, name: 'Print' },
        { icon: <Share />, name: 'Share' },
    ];

    const handleClick = useCallback(() => setOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setOpen(false), []);

    const handleClickAction = useCallback(
        (e: React.MouseEvent, action: VoidFunction) => {
            e.stopPropagation();
            handleClose();
            action();
        },
        [handleClose]
    );

    return (
        <>
            <Backdrop open={open} onClick={handleClose} />

            <SpeedDial
                ariaLabel="Help Menu"
                sx={{
                    position: 'fixed',
                    bottom: 8,
                    right: 8,
                }}
                icon={
                    <Tooltip title="Help Menu" placement="left">
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <Lightbulb />
                        </Box>
                    </Tooltip>
                }
                onClick={handleClick}
                open={open}
                FabProps={{
                    size: 'medium',
                }}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipOpen
                        onClick={(e) => {
                            handleClickAction(e, action.onClick);
                        }}
                        sx={{ whiteSpace: 'nowrap' }}
                        FabProps={{
                            sx: { margin: '6px' },
                        }}
                    />
                ))}
            </SpeedDial>
        </>
    );
}

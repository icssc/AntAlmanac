import { FileCopy, Print, Save, Share } from '@mui/icons-material';
import { Backdrop, SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip } from '@mui/material';
import { useCallback, useState } from 'react';

const actions = [
    { icon: <FileCopy />, name: 'Copy' },
    { icon: <Save />, name: 'Save' },
    { icon: <Print />, name: 'Print' },
    { icon: <Share />, name: 'Share' },
];

export function HelpMenu() {
    const [open, setOpen] = useState(false);

    const handleClick = useCallback(() => setOpen((prev) => !prev), []);
    const handleClose = useCallback(() => setOpen(false), []);

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
                        <SpeedDialIcon
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                            }}
                        />
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
                        onClick={handleClose}
                    />
                ))}
            </SpeedDial>
        </>
    );
}

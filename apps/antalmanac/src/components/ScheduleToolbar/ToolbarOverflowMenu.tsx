import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconButton, Menu, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';

interface ToolbarOverflowMenuProps {
    children: ReactNode;
    disabled?: boolean;
}

export function ToolbarOverflowMenu({ children, disabled }: ToolbarOverflowMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    return (
        <>
            <Tooltip title="More options">
                <IconButton onClick={handleOpen} disabled={disabled} size="medium">
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {children}
            </Menu>
        </>
    );
}

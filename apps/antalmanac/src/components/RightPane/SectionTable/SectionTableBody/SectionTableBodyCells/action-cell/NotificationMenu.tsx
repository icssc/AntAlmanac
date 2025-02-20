import { NotificationAdd, NotificationAddOutlined } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState, useCallback } from 'react';

import { NotificationStatus, useNotificationStore } from '$stores/NotificationStore';

const MENU_ITEMS: { status: keyof NotificationStatus; label: string }[] = [
    { status: 'openStatus', label: 'Course is OPEN' },
    { status: 'waitlistStatus', label: 'Course is WAITLIST' },
    { status: 'fullStatus', label: 'Course is FULL' },
    { status: 'restrictionStatus', label: 'Restriction Codes have Changed' },
];

interface NotificationMenuProps {
    sectionCode: string;
    term: string;
    notificationStatus?: NotificationStatus;
}

export function NotificationMenu({ sectionCode, term, notificationStatus }: NotificationMenuProps) {
    const { setNotifications } = useNotificationStore();

    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    const hasNotifications = notificationStatus && Object.values(notificationStatus).some((n) => n);

    const handleClick = useCallback((status: keyof NotificationStatus) => {
        setNotifications(sectionCode, term, status);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const handleNotificationClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    return (
        <>
            <IconButton onClick={handleNotificationClick}>
                {hasNotifications ? <NotificationAdd fontSize="small" /> : <NotificationAddOutlined fontSize="small" />}
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {MENU_ITEMS.map((item) => (
                    <MenuItem
                        key={item.status}
                        selected={notificationStatus?.[item.status]}
                        onClick={() => handleClick(item.status)}
                    >
                        {item.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

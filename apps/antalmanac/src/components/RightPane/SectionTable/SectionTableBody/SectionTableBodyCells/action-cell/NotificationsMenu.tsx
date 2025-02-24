import { NotificationAdd, NotificationAddOutlined } from '@mui/icons-material';
import { IconButton, ListItemButton, Menu, MenuItem, Typography } from '@mui/material';
import { AASection, Course } from '@packages/antalmanac-types';
import { useState, useCallback, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { NotificationStatus, useNotificationStore } from '$stores/NotificationStore';

const MENU_ITEMS: { status: keyof NotificationStatus; label: string }[] = [
    { status: 'openStatus', label: 'Course is OPEN' },
    { status: 'waitlistStatus', label: 'Course is WAITLIST' },
    { status: 'fullStatus', label: 'Course is FULL' },
    { status: 'restrictionStatus', label: 'Restriction Codes have Changed' },
];

interface NotificationsMenuProps {
    courseTitle: Course['title'];
    sectionCode: AASection['sectionCode'];
    term: string;
}

export const NotificationsMenu = memo(({ courseTitle, sectionCode, term }: NotificationsMenuProps) => {
    const key = sectionCode + ' ' + term;
    const [notification, setNotifications] = useNotificationStore(
        useShallow((store) => [store.notifications[key], store.setNotifications])
    );

    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    const notificationStatus = notification?.notificationStatus;
    const hasNotifications = notificationStatus && Object.values(notificationStatus).some((n) => n);

    const handleClick = useCallback(
        (status: keyof NotificationStatus) => {
            setNotifications({ courseTitle, sectionCode, term, status });
        },
        [courseTitle, sectionCode, setNotifications, term]
    );

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
                <ListItemButton
                    disabled={true}
                    style={{ opacity: 1 }} // Using style over sx to override disabled styles
                >
                    <Typography sx={{ fontWeight: 600 }}>Set Notifications For</Typography>
                </ListItemButton>
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
});

NotificationsMenu.displayName = 'NotificationsMenu';

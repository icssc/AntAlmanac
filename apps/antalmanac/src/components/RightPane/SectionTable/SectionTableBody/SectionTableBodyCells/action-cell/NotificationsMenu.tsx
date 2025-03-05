import { Check, EditNotifications, NotificationAddOutlined } from '@mui/icons-material';
import { IconButton, ListItemButton, Menu, MenuItem, Typography } from '@mui/material';
import { AASection, Course } from '@packages/antalmanac-types';
import { useState, useCallback, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { NotificationStatus, useNotificationStore } from '$stores/NotificationStore';

const MENU_ITEMS: { status: keyof NotificationStatus; label: string }[] = [
    { status: 'openStatus', label: 'Section is OPEN' },
    { status: 'waitlistStatus', label: 'Section is WAITLIST' },
    { status: 'fullStatus', label: 'Section is FULL' },
    { status: 'restrictionStatus', label: 'Restriction Codes have Changed' },
];

interface NotificationsMenuProps {
    section: AASection;
    term: string;
    courseTitle: Course['title'];
}

export const NotificationsMenu = memo(({ section, term, courseTitle }: NotificationsMenuProps) => {
    const notificationKey = section.sectionCode + ' ' + term;
    const [notification, setNotifications] = useNotificationStore(
        useShallow((store) => [store.notifications[notificationKey], store.setNotifications])
    );

    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    const notificationStatus = notification?.notificationStatus;
    const hasNotifications = notificationStatus && Object.values(notificationStatus).some((n) => n);

    const handleClick = useCallback(
        (status: keyof NotificationStatus) => {
            const { sectionType, sectionCode, restrictions } = section;
            const currStatus = section.status;
            setNotifications({
                courseTitle,
                sectionCode,
                sectionType,
                term,
                status,
                lastUpdated: currStatus,
                lastCodes: restrictions,
            });
        },
        [courseTitle, section, setNotifications, term]
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
                {hasNotifications ? (
                    <EditNotifications fontSize="small" />
                ) : (
                    <NotificationAddOutlined fontSize="small" />
                )}
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
                    <Typography sx={{ fontWeight: 600 }}>Notify When</Typography>
                </ListItemButton>
                {MENU_ITEMS.map((item) => {
                    const selected = notificationStatus?.[item.status];
                    return (
                        <MenuItem
                            key={item.status}
                            selected={selected}
                            onClick={() => handleClick(item.status)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <Check sx={{ visibility: selected ? 'visible' : 'hidden' }} aria-hidden="true" />
                            <Typography>{item.label}</Typography>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
});

NotificationsMenu.displayName = 'NotificationsMenu';

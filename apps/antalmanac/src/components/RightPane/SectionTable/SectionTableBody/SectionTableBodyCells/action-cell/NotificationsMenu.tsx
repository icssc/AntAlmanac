import { Check, EditNotifications, NotificationAddOutlined } from '@mui/icons-material';
import { IconButton, ListItemButton, Menu, MenuItem, Typography, Tooltip } from '@mui/material';
import { AASection, Course } from '@packages/antalmanac-types';
import { useState, useCallback, memo, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { SignInDialog } from '$components/dialogs/SignInDialog';
import { NotificationStatus, useNotificationStore } from '$stores/NotificationStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

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
    const loadNotifications = useNotificationStore(useShallow((store) => store.loadNotifications));
    const [notification, setNotifications] = useNotificationStore(
        useShallow((store) => [store.notifications[notificationKey], store.setNotifications])
    );
    const isDark = useThemeStore((store) => store.isDark);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [signInOpen, setSignInOpen] = useState(false);

    const { session, isGoogleUser, fetchUserData } = useSessionStore(
        useShallow((state) => ({
            session: state.session,
            isGoogleUser: state.isGoogleUser,
            fetchUserData: state.fetchUserData,
        }))
    );

    useEffect(() => {
        if (isGoogleUser) {
            loadNotifications();
        }
    }, [isGoogleUser, loadNotifications]);

    useEffect(() => {
        fetchUserData(session);
    }, [session, fetchUserData]);

    const notificationStatus = notification?.notificationStatus;
    const hasNotifications = notificationStatus && Object.values(notificationStatus).some((n) => n);

    const handleClick = useCallback(
        (status: keyof NotificationStatus) => {
            const { sectionType, sectionCode, restrictions, units, sectionNum } = section;
            const currStatus = section.status;
            setNotifications({
                courseTitle,
                sectionCode,
                sectionType,
                units: Number(units),
                sectionNum,
                term,
                status,
                lastUpdated: currStatus,
                lastCodes: restrictions,
            });
        },
        [courseTitle, section, setNotifications, term]
    );

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleNotificationClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            if (!isGoogleUser) {
                setSignInOpen(true);
                return;
            }
            setAnchorEl(event.currentTarget);
        },
        [isGoogleUser]
    );

    const handleSignInClose = useCallback(() => {
        setSignInOpen(false);
    }, []);

    return (
        <>
            <IconButton onClick={handleNotificationClick}>
                {isGoogleUser ? (
                    hasNotifications ? (
                        <EditNotifications fontSize="small" />
                    ) : (
                        <NotificationAddOutlined fontSize="small" />
                    )
                ) : (
                    <Tooltip title="Sign in to access notifications">
                        <NotificationAddOutlined fontSize="small" sx={{ opacity: 0.5 }} />
                    </Tooltip>
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
                <ListItemButton disabled={true} style={{ opacity: 1 }}>
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

            <SignInDialog open={signInOpen} onClose={handleSignInClose} isDark={isDark} feature="Notification" />
        </>
    );
});

NotificationsMenu.displayName = 'NotificationsMenu';

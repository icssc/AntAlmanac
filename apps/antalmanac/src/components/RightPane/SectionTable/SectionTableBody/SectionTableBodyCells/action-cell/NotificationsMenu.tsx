import { Check, EditNotifications, NotificationAddOutlined } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import type { AASection, Course } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { NotificationEmailTooltip } from '$components/RightPane/AddedCourses/Notifications/NotificationEmailTooltip';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import analyticsEnum, { AANTS_ANALYTICS_ACTIONS, logAnalytics } from '$lib/analytics/analytics';
import { type NotifyOn, useNotificationStore } from '$stores/NotificationStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

const MENU_ITEMS: { status: keyof NotifyOn; label: string }[] = [
    { status: 'notifyOnOpen', label: 'Section is OPEN' },
    { status: 'notifyOnWaitlist', label: 'Section is WAITLIST' },
    { status: 'notifyOnFull', label: 'Section is FULL' },
    { status: 'notifyOnRestriction', label: 'Restriction Codes have Changed' },
];

interface NotificationsMenuProps {
    section: AASection;
    term: string;
    courseTitle: Course['title'];
    deptCode?: string;
    courseNumber?: string;
}

export const NotificationsMenu = memo(
    ({ section, term, courseTitle, deptCode, courseNumber }: NotificationsMenuProps) => {
        const notificationKey = section.sectionCode + ' ' + term;
        const [notification, setNotifications] = useNotificationStore(
            useShallow((store) => [store.notifications[notificationKey], store.setNotifications])
        );
        const isDark = useThemeStore((store) => store.isDark);

        const postHog = usePostHog();

        const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
        const [signInOpen, setSignInOpen] = useState(false);

        const { session, isGoogleUser } = useSessionStore(
            useShallow((state) => ({
                session: state.session,
                isGoogleUser: state.isGoogleUser,
            }))
        );

        const notifyOn = notification?.notifyOn;
        const hasNotifications = notifyOn && Object.values(notifyOn).some((n) => n);

        const handleClick = useCallback(
            (status: keyof NotifyOn) => {
                const { sectionType, sectionCode, restrictions, units, sectionNum, instructors } = section;
                const currStatus = section.status;
                logAnalytics(postHog, {
                    category: analyticsEnum.aants,
                    action: AANTS_ANALYTICS_ACTIONS[status],
                    customProps: { sectionCode, term, source: 'menu' },
                });
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
                    deptCode,
                    courseNumber,
                    instructors,
                });
            },
            [courseTitle, section, setNotifications, term, deptCode, courseNumber, postHog]
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
                logAnalytics(postHog, {
                    category: analyticsEnum.aants,
                    action: analyticsEnum.aants.actions.OPEN_SECTION_NOTIFICATIONS,
                    customProps: { sectionCode: section.sectionCode, term },
                });
                setAnchorEl(event.currentTarget);
            },
            [isGoogleUser, postHog, section.sectionCode, term]
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
                    <MenuItem
                        sx={{
                            cursor: 'default',
                            '&:hover': { backgroundColor: 'transparent' },
                            pointerEvents: 'none',
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                width: '100%',
                            }}
                        >
                            <Typography sx={{ fontWeight: 600 }}>Notify When</Typography>
                            <Box
                                sx={{
                                    pointerEvents: 'auto',
                                    display: 'inline-flex',
                                    marginLeft: 'auto',
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <NotificationEmailTooltip sessionToken={session} />
                            </Box>
                        </Box>
                    </MenuItem>
                    {MENU_ITEMS.map((item) => {
                        const selected = notifyOn?.[item.status];
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
    }
);

NotificationsMenu.displayName = 'NotificationsMenu';

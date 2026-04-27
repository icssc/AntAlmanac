import { getSettingsPopoverPaperSx } from '$components/Header/headerStyles';
import { ProfileMenuButtons } from '$components/Header/ProfileMenuButtons';
import { SettingsMenu } from '$components/Header/Settings/SettingsMenu';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';
import { getErrorMessage } from '$lib/utils';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';
import LogoutIcon from '@mui/icons-material/Logout';
import { Divider, ListItemIcon, ListItemText, MenuItem, Popover } from '@mui/material';
import type { User } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { type MouseEvent, useCallback, useEffect, useState } from 'react';

interface SignoutProps {
    onLogoutComplete?: () => void;
}

export function Signout({ onLogoutComplete }: SignoutProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<Pick<User, 'name' | 'avatar' | 'email'> | null>(null);
    const { sessionIsValid, clearSession } = useSessionStore();
    const postHog = usePostHog();
    const isDark = useThemeStore((store) => store.isDark);

    const open = Boolean(anchorEl);
    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = async () => {
        setAnchorEl(null);

        try {
            const logoutUrl = await clearSession();
            onLogoutComplete?.();

            logAnalytics(postHog, {
                category: analyticsEnum.auth,
                action: analyticsEnum.auth.actions.SIGN_OUT,
            });

            if (logoutUrl) {
                window.location.href = logoutUrl;
            }
        } catch (error) {
            console.error('Error during logout', error);
            onLogoutComplete?.();
            logAnalytics(postHog, {
                category: analyticsEnum.auth,
                action: analyticsEnum.auth.actions.SIGN_OUT_FAIL,
                error: getErrorMessage(error),
            });
        } finally {
            postHog?.reset();
        }
    };

    const handleAuthChange = useCallback(async () => {
        if (sessionIsValid) {
            const userData = await trpc.userData.getUserAndAccount.query().then((res) => res.users);
            setUser({
                name: userData.name ?? undefined,
                avatar: userData.avatar ?? undefined,
                email: userData.email ?? undefined,
            });
        }
    }, [sessionIsValid]);

    useEffect(() => {
        if (sessionIsValid) {
            handleAuthChange();
        }
    }, [handleAuthChange, sessionIsValid]);

    return (
        <div id="load-save-container">
            <ProfileMenuButtons user={user} handleOpen={handleClick} handleSettingsOpen={handleClick} />
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: getSettingsPopoverPaperSx(isDark),
                    },
                }}
            >
                <SettingsMenu user={user} onClose={() => setAnchorEl(null)} />

                <Divider style={{ marginTop: '20px', marginBottom: '12px' }} />

                <MenuItem onClick={handleLogout} sx={{ px: 1, py: 1.25, borderRadius: 1 }}>
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Log out"
                        primaryTypographyProps={{
                            sx: {
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                            },
                        }}
                    />
                </MenuItem>
            </Popover>
        </div>
    );
}

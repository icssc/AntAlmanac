import LogoutIcon from "@mui/icons-material/Logout";
import { Divider, ListItemIcon, ListItemText, MenuItem, Popover } from "@mui/material";
import type { User } from "@packages/antalmanac-types";
import { type MouseEvent, useMemo, useState } from "react";
import { getSettingsPopoverPaperSx } from "$components/Header/headerStyles";
import { ProfileMenuButtons } from "$components/Header/ProfileMenuButtons";
import { SettingsMenu } from "$components/Header/Settings/SettingsMenu";
import { useSessionStore } from "$stores/SessionStore";
import { useThemeStore } from "$stores/SettingsStore";

interface SignoutProps {
    onLogoutComplete?: () => void;
}

export function Signout({ onLogoutComplete }: SignoutProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { sessionIsValid, clearSession, name, avatar, email } = useSessionStore();
    const isDark = useThemeStore((store) => store.isDark);

    const user = useMemo<Pick<User, "name" | "avatar" | "email"> | null>(
        () =>
            sessionIsValid
                ? {
                      name: name ?? undefined,
                      avatar: avatar ?? undefined,
                      email: email ?? undefined,
                  }
                : null,
        [sessionIsValid, name, avatar, email],
    );

    const open = Boolean(anchorEl);
    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = async () => {
        setAnchorEl(null);

        try {
            const logoutUrl = await clearSession();
            onLogoutComplete?.();

            if (logoutUrl) {
                window.location.href = logoutUrl;
            }
        } catch (error) {
            console.error("Error during logout", error);
            onLogoutComplete?.();
        }
    };

    return (
        <div id="load-save-container">
            <ProfileMenuButtons user={user} handleOpen={handleClick} handleSettingsOpen={handleClick} />
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                slotProps={{
                    paper: {
                        sx: getSettingsPopoverPaperSx(isDark),
                    },
                }}
            >
                <SettingsMenu user={user} onClose={() => setAnchorEl(null)} />

                <Divider style={{ marginTop: "20px", marginBottom: "12px" }} />

                <MenuItem onClick={handleLogout} sx={{ px: 1, py: 1.25, borderRadius: 1 }}>
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Log out"
                        primaryTypographyProps={{
                            sx: {
                                fontSize: "1rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                            },
                        }}
                    />
                </MenuItem>
            </Popover>
        </div>
    );
}

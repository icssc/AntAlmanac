import { useSessionStore } from "$stores/SessionStore";
import { HelpOutline } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { memo } from "react";

interface NotificationEmailTooltipProps {
    sessionToken?: string | null;
}
export const NotificationEmailTooltip = memo(
    ({ sessionToken: _sessionToken }: NotificationEmailTooltipProps) => {
        const email = useSessionStore((state) => state.email);

        if (!email) {
            return null;
        }

        return (
            <Tooltip
                title={
                    <>
                        {" "}
                        Notifications will be sent to <strong>{email}</strong>{" "}
                    </>
                }
                arrow
                slotProps={{
                    tooltip: {
                        sx: { fontSize: "0.9rem" },
                    },
                }}
            >
                <IconButton size="small" sx={{ padding: 0, marginLeft: 0.5 }}>
                    <HelpOutline fontSize="small" />
                </IconButton>
            </Tooltip>
        );
    },
);

NotificationEmailTooltip.displayName = "NotificationEmailTooltip";

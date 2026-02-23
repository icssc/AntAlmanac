import { Notification, NotifyOn, useNotificationStore } from "$stores/NotificationStore";
import { Checkbox, TableCell } from "@mui/material";
import { memo, useCallback } from "react";

type NotificationTableRowCheckboxProps = Omit<Notification, "notifyOn"> & {
    notificationKey: string;
    statusKey: keyof NotifyOn;
};

export const NotificationTableRowCheckbox = memo(
    ({
        courseTitle,
        sectionCode,
        term,
        units,
        sectionNum,
        sectionType,
        notificationKey,
        statusKey,
        lastUpdated,
        lastCodes,
    }: NotificationTableRowCheckboxProps) => {
        const status = useNotificationStore(
            (state) => state.notifications[notificationKey]?.notifyOn[statusKey] ?? false,
        );
        const setNotifications = useNotificationStore((state) => state.setNotifications);

        const handleClick = useCallback(() => {
            setNotifications({
                courseTitle,
                sectionCode,
                sectionType,
                term,
                units,
                sectionNum,
                status: statusKey,
                lastUpdated,
                lastCodes,
            });
        }, [
            setNotifications,
            courseTitle,
            sectionCode,
            sectionType,
            term,
            statusKey,
            lastUpdated,
            lastCodes,
            units,
            sectionNum,
        ]);

        return (
            <TableCell align="center">
                <Checkbox checked={status} onClick={handleClick} />
            </TableCell>
        );
    },
);

NotificationTableRowCheckbox.displayName = "NotificationTableRowCheckbox";

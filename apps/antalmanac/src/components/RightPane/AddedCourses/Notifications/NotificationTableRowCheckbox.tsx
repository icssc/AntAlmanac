import analyticsEnum, { AANTS_ANALYTICS_ACTIONS, logAnalytics } from '$lib/analytics/analytics';
import { type Notification, type NotifyOn, useNotificationStore } from '$stores/NotificationStore';
import { Checkbox, TableCell } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

type NotificationTableRowCheckboxProps = Omit<Notification, 'notifyOn'> & {
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
        lastUpdatedStatus,
        lastCodes,
    }: NotificationTableRowCheckboxProps) => {
        const [status, setNotifications] = useNotificationStore(
            useShallow((state) => [
                state.notifications[notificationKey]?.notifyOn[statusKey] ?? false,
                state.setNotifications,
            ])
        );

        const postHog = usePostHog();

        const handleClick = useCallback(() => {
            logAnalytics(postHog, {
                category: analyticsEnum.aants,
                action: AANTS_ANALYTICS_ACTIONS[statusKey],
                customProps: { sectionCode, term: term.shortName, source: 'section_row' },
            });
            setNotifications({
                courseTitle,
                sectionCode,
                sectionType,
                term,
                units,
                sectionNum,
                status: statusKey,
                lastUpdatedStatus,
                lastCodes,
            });
        }, [
            setNotifications,
            courseTitle,
            sectionCode,
            sectionType,
            term,
            statusKey,
            lastUpdatedStatus,
            lastCodes,
            units,
            sectionNum,
            postHog,
        ]);

        return (
            <TableCell align="center">
                <Checkbox checked={status} onClick={handleClick} />
            </TableCell>
        );
    }
);

NotificationTableRowCheckbox.displayName = 'NotificationTableRowCheckbox';

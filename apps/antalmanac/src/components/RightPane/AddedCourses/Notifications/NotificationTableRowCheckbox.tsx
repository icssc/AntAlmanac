import { TableCell, Checkbox } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback } from 'react';

import analyticsEnum, { AANTS_ANALYTICS_ACTIONS, logAnalytics } from '$lib/analytics/analytics';
import { Notification, NotifyOn, useNotificationStore } from '$stores/NotificationStore';

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
        lastUpdated,
        lastCodes,
    }: NotificationTableRowCheckboxProps) => {
        const status = useNotificationStore(
            (state) => state.notifications[notificationKey]?.notifyOn[statusKey] ?? false
        );
        const setNotifications = useNotificationStore((state) => state.setNotifications);

        const postHog = usePostHog();

        const handleClick = useCallback(() => {
            logAnalytics(postHog, {
                category: analyticsEnum.aants,
                action: AANTS_ANALYTICS_ACTIONS[statusKey],
                customProps: { sectionCode, term, source: 'section_row' },
            });
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

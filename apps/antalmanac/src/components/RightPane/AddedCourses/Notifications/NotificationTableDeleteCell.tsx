import { Delete } from '@mui/icons-material';
import { IconButton, Box } from '@mui/material';
import { usePostHog } from 'posthog-js/react';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useNotificationStore } from '$stores/NotificationStore';

interface DeleteNotificationButtonProps {
    notificationKey: string;
}

export const NotificationTableDeleteCell = ({ notificationKey }: DeleteNotificationButtonProps) => {
    const deleteNotification = useNotificationStore((state) => state.deleteNotification);
    const postHog = usePostHog();

    const handleDelete = () => {
        logAnalytics(postHog, {
            category: analyticsEnum.aants,
            action: analyticsEnum.aants.actions.DELETE_NOTIFICATION,
            customProps: { notificationKey },
        });
        deleteNotification(notificationKey);
    };

    return (
        <TableBodyCellContainer>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                }}
            >
                <IconButton onClick={handleDelete}>
                    <Delete fontSize="small" />
                </IconButton>
            </Box>
        </TableBodyCellContainer>
    );
};

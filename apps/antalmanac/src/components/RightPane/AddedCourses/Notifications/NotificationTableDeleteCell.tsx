import { Delete } from '@mui/icons-material';
import { IconButton, Box } from '@mui/material';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useNotificationStore } from '$stores/NotificationStore';

interface DeleteNotificationButtonProps {
    notificationKey: string;
}

export const NotificationTableDeleteCell = ({ notificationKey }: DeleteNotificationButtonProps) => {
    const deleteNotification = useNotificationStore((state) => state.deleteNotification);

    const handleDelete = () => {
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

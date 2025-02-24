import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
} from '@mui/material';
import { useCallback, useState } from 'react';

import { NotificationTableRow } from '$components/RightPane/AddedCourses/NotificationsTableRow';
import { useNotificationStore } from '$stores/NotificationStore';

export function NotificationsTable() {
    const keys = Object.keys(useNotificationStore.getState().notifications);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = useCallback((_: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    }, []);

    if (keys.length === 0) {
        return "You haven't added any notifications yet!";
    }

    const paginatedKeys = keys.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader sx={{ minWidth: 650 }} size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Term</TableCell>
                            <TableCell>Section Code</TableCell>
                            <TableCell>Section Name</TableCell>
                            <TableCell align="center">Open</TableCell>
                            <TableCell align="center">Waitlist</TableCell>
                            <TableCell align="center">Full</TableCell>
                            <TableCell align="center">Restrictions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedKeys.map((key) => (
                            <NotificationTableRow key={key} notificationKey={key} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={keys.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
}

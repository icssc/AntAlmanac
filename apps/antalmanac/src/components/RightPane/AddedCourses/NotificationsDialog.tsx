import { Notifications } from '@mui/icons-material';
import {
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    SxProps,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
} from '@mui/material';
import { useCallback, useState } from 'react';

import { useNotificationStore } from '$stores/NotificationStore';

interface NotificationsDialogProps {
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function NotificationsDialog({ disabled, buttonSx }: NotificationsDialogProps) {
    const { notifications } = useNotificationStore();

    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Tooltip title="Notifications Menu">
                <span>
                    <IconButton sx={buttonSx} onClick={handleOpen} size="small" disabled={disabled}>
                        <Notifications />
                    </IconButton>
                </span>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Course Notifications</DialogTitle>
                <DialogContent>
                    {notifications ? (
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
                                        {Object.entries(notifications)
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map(([key, notification]) => {
                                                const { term, sectionCode, notificationStatus } = notification;
                                                const { openStatus, waitlistStatus, fullStatus, restrictionStatus } =
                                                    notificationStatus;

                                                return (
                                                    <TableRow
                                                        key={key}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        <TableCell>{term}</TableCell>
                                                        <TableCell>{sectionCode}</TableCell>
                                                        <TableCell>{'foobar'}</TableCell>
                                                        <TableCell align="center">
                                                            <Checkbox checked={openStatus} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Checkbox checked={waitlistStatus} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Checkbox checked={fullStatus} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Checkbox checked={restrictionStatus} />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 100]}
                                component="div"
                                count={Object.entries(notifications).length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    ) : (
                        // Object.entries(notifications).map((notification) => {
                        //       return <div>fdasfasdfsdaf</div>;
                        //   })
                        "You haven't added any notifications yet!"
                    )}
                    {/* <Box padding={1}>
                        <TextField fullWidth label="Name" onChange={handleNameChange} value={name} />
                    </Box> */}
                </DialogContent>
            </Dialog>
        </>
    );
}

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
                        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                            <Table stickyHeader sx={{ minWidth: 650 }} size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Term</TableCell>
                                        <TableCell align="center">Section Code</TableCell>
                                        <TableCell align="center">Course Open</TableCell>
                                        <TableCell align="center">Course Waitlist </TableCell>
                                        <TableCell align="center">Course Full </TableCell>
                                        <TableCell align="center">Restrictions Changed </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(notifications).map(([key, notification]) => {
                                        const [sectionCode, ...quarterParts] = key.split(' ');
                                        const quarter = quarterParts.join(' ');

                                        const { openStatus, waitlistStatus, fullStatus, restrictionStatus } =
                                            notification;

                                        return (
                                            <TableRow
                                                key={key}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell>{quarter}</TableCell>
                                                <TableCell align="center">{sectionCode}</TableCell>
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

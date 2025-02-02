import {
    Backdrop,
    type BackdropProps,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';

import { getLocalStoragePatchNotesKey, setLocalStoragePatchNotesKey } from '$lib/localStorage';

/**
 * Show modal only if the current patch notes haven't been shown.
 * This is denoted by a date string YYYYMMDD
 *
 * @example '20230819'
 */
export const latestPatchNotesUpdate = '20250121';

/**
 * Whether the user's last visited patch notes is outdated.
 */
function isOutdated() {
    return getLocalStoragePatchNotesKey() != latestPatchNotesUpdate;
}

/**
 * Custom backdrop that can be tested via a test ID.
 */
function PatchNotesBackdrop(props: BackdropProps) {
    return <Backdrop {...props} data-testid={backdropTestId} />;
}

/**
 * PatchNotes follows structure/layout of AboutPage.tsx
 */
function PatchNotes() {
    const [open, setOpen] = useState(() => isOutdated());

    const handleClose = useCallback(() => {
        setLocalStoragePatchNotesKey(latestPatchNotesUpdate);
        setOpen(false);
    }, []);

    return (
        <Dialog
            fullWidth={true}
            onClose={handleClose}
            open={open}
            data-testid={dialogTestId}
            slots={{ backdrop: PatchNotesBackdrop }}
        >
            <DialogTitle>{"What's New - January 2025"}</DialogTitle>

            <DialogContent>
                <Typography>Features</Typography>
                <ul>
                    <li>
                        Added column linking to course syllabi (thanks to the ASUCI{' '}
                        <a href="https://asuci.uci.edu/academicvp/" target="_blank">
                            AAVP
                        </a>
                        !).
                    </li>
                    <li>Direct course search buttons in calendar pop-up and course header.</li>
                    <li>Search caching for faster results on repeated queries.</li>
                </ul>
                <Typography>Bug Fixes</Typography>
                <ul>
                    <li>Loading schedules with BIO SCI classes. Thank you for your feedback and patience!</li>
                </ul>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="primary" data-testid={closeButtonTestId}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PatchNotes;

/* Used for Tests */
export const dialogTestId = 'patch-notes-dialog';

export const backdropTestId = 'patch-notes-backdrop';

export const closeButtonTestId = 'patch-notes-close';

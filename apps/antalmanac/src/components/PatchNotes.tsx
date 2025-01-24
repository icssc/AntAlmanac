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
export const latestPatchNotesUpdate = '20241124';

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
    const [open, setOpen] = useState(isOutdated());

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
            <DialogTitle>{"What's New - November 2024"}</DialogTitle>

            <DialogContent>
                <Typography>Migration</Typography>
                <ul>
                    <li>We are migrating our database to support exciting features coming this year!</li>
                    <li>
                        If you experience issues with saving and retrieving schedules, please let us know by filling out
                        the{' '}
                        <a
                            href="https://docs.google.com/forms/d/e/1FAIpQLSe0emRHqog-Ctl8tjZfJvewY_CSGXys8ykBkFBy1EEUUUHbUw/viewform"
                            target="_blank"
                        >
                            feedback form
                        </a>
                        .
                    </li>
                </ul>

                <Typography>Features</Typography>
                <ul>
                    <li>Search now contains all new classes and will update automatically!</li>
                    <li>Many bug fixes and quality-of-life improvements</li>
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

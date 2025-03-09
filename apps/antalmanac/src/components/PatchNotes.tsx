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
export const latestPatchNotesUpdate = '20250309';

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
            <DialogTitle>{"What's New - March 2025"}</DialogTitle>

            <DialogContent>
                <Typography>Features</Typography>
                <ul>
                    <li>Log in with Google OAuth❗</li>
                    <ul>
                        <li>
                            Import your old schedules by clicking on the import button &#40;top&#41; and selecting
                            &quot;From Guest Username&quot;.
                        </li>
                        <li>Precursor to exciting features!</li>
                        <li>
                            Please submit{' '}
                            <a href="https://form.asana.com/?k=fZ3SGnuGknDmzTYdocgIUg&d=1208267282546207">Feedback</a>{' '}
                            if you run into any issues.
                        </li>
                    </ul>
                    <li>Spring and Summer 2025 data.</li>
                    <li>Compact calendar header on mobile.</li>
                </ul>
                <Typography>Bug Fixes</Typography>
                <ul>
                    <li>Undo disabled for first state after load.</li>
                    <li>Off-by-one-error in enrollment graph dates.</li>
                    <li>Quick search failing to reset search fields.</li>
                    <li>Unsightly section table text wrapping.</li>
                    <li>Temporary fixes for some load/save issues.</li>
                    <li>Other deployment fixes.</li>
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

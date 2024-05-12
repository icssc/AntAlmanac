import { useCallback, useState } from 'react';
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
import { getLocalStoragePatchNotesKey, setLocalStoragePatchNotesKey } from '$lib/localStorage';

/**
 * Show modal only if the current patch notes haven't been shown.
 * This is denoted by a date string YYYYMMDD
 *
 * @example '20230819'
 */
export const latestPatchNotesUpdate = '20230819';

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
            <DialogTitle>{"What's New - October 2023"}</DialogTitle>

            <DialogContent>
                <Typography>Features</Typography>
                <ul>
                    <li>
                        You can now hover over the Zotistics button to see the Zotistics graph! On mobile, you can still
                        click the Zotistics button to toggle the graph.
                    </li>
                </ul>
                <img
                    src="https://user-images.githubusercontent.com/78244965/277567417-f9816b9d-ddda-4c0f-80f4-eeac92428612.gif"
                    alt="(gif of the new feature)"
                    style={{
                        maxWidth: '100%',
                        boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.4)',
                    }}
                />
                <br />
                Remember to use the{' '}
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSe0emRHqog-Ctl8tjZfJvewY_CSGXys8ykBkFBy1EEUUUHbUw/viewform">
                    feedback form
                </a>{' '}
                to let us know what you think!
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

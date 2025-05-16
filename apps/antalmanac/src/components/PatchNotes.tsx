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
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { setLocalStoragePatchNotesKey } from '$lib/localStorage';
import { LATEST_PATCH_NOTES_UPDATE, useHelpMenuStore } from '$stores/HelpMenuStore';

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
    const [showPatchNotes, setShowPatchNotes] = useHelpMenuStore(
        useShallow((store) => [store.showPatchNotes, store.setShowPatchNotes])
    );

    const handleClose = useCallback(() => {
        setLocalStoragePatchNotesKey(LATEST_PATCH_NOTES_UPDATE);
        setShowPatchNotes(false);
    }, [setShowPatchNotes]);

    return (
        <Dialog
            fullWidth={true}
            onClose={handleClose}
            open={showPatchNotes}
            data-testid={dialogTestId}
            slots={{ backdrop: PatchNotesBackdrop }}
        >
            <DialogTitle>{"What's New - May 2025"}</DialogTitle>

            <DialogContent>
                <Typography>Features</Typography>
                <ul>
                    <li>
                        Sign-in with Google! This will keep your schedules secure and enable exciting upcoming features.
                        Stay tuned!
                        <li>
                            If you encounter any issues reach out to us via{' '}
                            <a href="https://discord.gg/8CSGbGBqz8">discord</a> or our{' '}
                            <a href="https://forms.gle/234567890">feedback form</a>
                        </li>
                    </li>
                    <li>Automatic addition of new terms so you don&apos;t have to wait for us to do it manually.</li>
                    <li>Filtering by day of the week in advanced search.</li>
                    <li>Optimizations to speed up schedule saving.</li>
                    <li>Outage page for the rare occasion that Antalmanac is down.</li>
                </ul>
                <Typography>Bug Fixes</Typography>
                <ul>
                    <li>Advanced search fields getting overridden by URL parameters.</li>
                    <li>Off-by-one error in enrollment history graph.</li>
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

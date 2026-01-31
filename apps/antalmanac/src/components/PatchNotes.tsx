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
import Image from 'next/image';
import Link from 'next/link';
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
            <DialogTitle>{'You can now create 4-year plans from AntAlmanac!'}</DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 2 }}>
                    AntAlmanac and PeterPortal are now unified into one ultimate course planning app. Learn more in our{' '}
                    <Link href="https://docs.icssc.club/docs/about/antalmanac/merge" target="_blank">
                        blog post
                    </Link>
                    !
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Image src="/assets/merge-switcher.png" alt="4-year plan" width={350} height={50} />
                </div>
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

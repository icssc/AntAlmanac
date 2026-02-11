import {
    Backdrop,
    Box,
    type BackdropProps,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Stack,
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
            <DialogTitle>{'Patch Notes Febuary 6, 2026'}</DialogTitle>

            <DialogContent>
                <Stack spacing={2} alignItems="start">
                    <Typography variant="h6">You can now create 4-year plans from AntAlmanac!</Typography>

                    <Typography>
                        AntAlmanac and PeterPortal are now unified into one ultimate course planning app. Learn more in
                        our{' '}
                        <Link href="https://docs.icssc.club/docs/about/antalmanac/merge" target="_blank">
                            blog post
                        </Link>
                        !
                    </Typography>

                    <Stack
                        direction="row"
                        alignSelf="center"
                        sx={{
                            width: '100%',
                            maxWidth: 350,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Image
                            src="/assets/merge-switcher.png"
                            alt="4-year plan"
                            width={350}
                            height={50}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: '350px',
                                borderRadius: 8,
                            }}
                        />
                    </Stack>

                    <Typography variant="h6">AntAlmanac Notification Tracking System (AANTS)!</Typography>

                    <Typography>
                        AANTS allows you to receive notifications when classes OPEN, CLOSE, WAITLIST, or have their
                        restriction codes changed.
                    </Typography>

                    <Stack direction="row" alignSelf="center">
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: 425,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                src="/assets/aants-preview.png"
                                alt="AANTS example"
                                width={425}
                                height={185}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxWidth: '425px',
                                    borderRadius: 8,
                                }}
                            />
                        </Box>
                    </Stack>
                </Stack>
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

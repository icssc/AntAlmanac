import { useCallback, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

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
    return localStorage.getItem('latestPatchSeen') != latestPatchNotesUpdate;
}

/**
 * PatchNotes follows structure/layout of AboutPage.tsx
 */
function PatchNotes() {
    const [open, setOpen] = useState(isOutdated());

    const handleClose = useCallback(() => {
        localStorage.setItem('latestPatchSeen', latestPatchNotesUpdate);
        setOpen(false);
    }, [setOpen]);

    return (
        <Dialog fullWidth={true} onClose={handleClose} open={open} data-testid="dialog">
            <DialogTitle>{"What's New - August 2023"}</DialogTitle>

            <DialogContent>
                <Typography>Features</Typography>
                <ul>
                    <li>Courses will now be greyed out if they conflict with your current schedule</li>
                </ul>
                <img
                    src="https://user-images.githubusercontent.com/100006999/255796434-10555ecb-5632-4ff3-8be3-c04267722011.gif"
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
                <Button onClick={handleClose} color="primary" data-testid="close button">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PatchNotes;

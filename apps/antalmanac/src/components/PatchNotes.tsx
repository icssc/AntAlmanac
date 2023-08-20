import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { useEffect, useState } from 'react';

// PatchNotes follows structure/layout of AboutPage.tsx
const PatchNotes = () => {
    const [isOpen, setIsOpen] = useState(true);

    // show modal only on first visit
    useEffect(() => {
        if (localStorage.getItem('visitedCount') == 'y') {
            setIsOpen(false);
        } else {
            localStorage.setItem('visitedCount', 'y');
        }
    }, []);

    return (
        <>
            <Dialog
                fullWidth={true}
                onClose={(event, reason) => {
                    /* 
                allow the user to exit the modal using their keyboard 
                or by clicking outside the dialog 
                */
                    if (reason == 'backdropClick' || reason == 'escapeKeyDown') {
                        setIsOpen(false);
                    }
                }}
                open={isOpen}
            >
                <DialogTitle>{"What's New - August 2023"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Features
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
                        ></img>
                        <br />
                        Remember to use the{' '}
                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSe0emRHqog-Ctl8tjZfJvewY_CSGXys8ykBkFBy1EEUUUHbUw/viewform">
                            feedback form
                        </a>{' '}
                        to let us know what you think!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setIsOpen(false);
                        }}
                        color="primary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PatchNotes;

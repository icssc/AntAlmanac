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
                <DialogTitle>{"What's New - February 2023"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Features
                        <ul>
                            <li>
                                Added 2023 Spring Quarter, 2023 Summer Session 1, 2023 10-wk Summer, and 2023 Summer
                                Session 2 courses
                            </li>
                            <li>
                                Lectures/discussions/labs for the same course will now share colors when added to
                                Calendar
                            </li>
                            <li>You can now resize the calendar with the blue bar in the middle of the page. </li>
                            <li>Added this changelog!</li>
                        </ul>
                        Bug Fixes
                        <ul>
                            <li>Fixed issues with displaying GE-III courses</li>
                            <li>Fixed courses with multiple locations appearing as independent events</li>
                        </ul>
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

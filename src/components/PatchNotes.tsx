import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

// PatchNotes follows structure/layout of AboutPage.tsx
const PatchNotes = () => {
    const [isOpen, setIsOpen] = useState(true);

    // show modal only on first visit    
    useEffect(() => {
        if (localStorage.getItem('visitedcount')) {
            setIsOpen(false);
        } else {
            localStorage.setItem('visitedcount', '1');
        }
    }, []);
        
    
    return(
        <>
            <Dialog fullWidth={true} onClose={(event, reason) => {
                /* 
                allow the user to exit the modal using their keyboard 
                or by clicking outside the dialog 
                */
                if(reason == 'backdropClick' || reason == 'escapeKeyDown') {
                setIsOpen(false);
                }
            }} open={isOpen}>
                <DialogTitle>{"What's New - February 2023"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Features
                        <ul>
                            <li>Added 2023 Spring Quarter courses</li>
                            <li>Courses will now share colors when added to Calendar</li>
                            <li>Added this changelog!</li>
                        </ul>
                        Bug Fixes
                        <ul>
                            <li>Fixed issues with displaying GE-III courses</li>
                            <li>Fixed courses with multiple locations appearing as independent events</li>
                        </ul>
                        Other
                        <ul>
                        </ul>
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
    )
  }

export default PatchNotes
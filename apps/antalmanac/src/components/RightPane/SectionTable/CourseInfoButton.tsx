import { Button, Popover, Paper, Popper, useMediaQuery, Box } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React, { useState } from 'react';

import { MOBILE_BREAKPOINT } from '../../../globals';
import { logAnalytics } from '$lib/analytics';

const styles = {
    button: {
        backgroundColor: '#385EB1',
        color: '#fff',
    },
};

interface CourseInfoButtonProps {
    classes: ClassNameMap;
    text: string;
    icon: React.ReactElement;
    redirectLink?: string;
    popupContent?: React.ReactElement;
    analyticsAction: string;
    analyticsCategory: string;
}

function CourseInfoButton({
    classes,
    text,
    icon,
    redirectLink,
    popupContent,
    analyticsAction,
    analyticsCategory,
}: CourseInfoButtonProps) {
    const [popupAnchor, setPopupAnchor] = useState<HTMLElement | null>(null);
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
        // If there is popup content, allow the content to be shown when the button is hovered
        if (popupContent) {
            setPopupAnchor(event.currentTarget);
        }
    };

    const handleMouseLeave = () => {
        if (popupContent) {
            setPopupAnchor(null);
        }
    };

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ display: 'flex' }}>
            <Button
                className={classes.button}
                startIcon={!isMobileScreen && icon}
                variant="contained"
                size="small"
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                    logAnalytics({
                        category: analyticsCategory,
                        action: analyticsAction,
                    });

                    if (redirectLink) {
                        window.open(redirectLink);
                    }

                    if (popupContent) {
                        setPopupAnchor(event.currentTarget);
                    }
                }}
            >
                {text}
            </Button>

            {popupContent && (
                // <Popover
                //     anchorEl={popupAnchor}
                //     open={Boolean(popupAnchor)}
                //     onClose={() => setPopupAnchor(null)}
                //     anchorOrigin={{
                //         vertical: 'bottom',
                //         horizontal: 'center',
                //     }}
                //     transformOrigin={{
                //         vertical: 'top',
                //         horizontal: 'center',
                //     }}
                //     // This styling is needed in order for the popover to actually close
                //     // when the mouse leaves the CourseInfoButton.
                //     // For reference: https://github.com/mui/material-ui/issues/7212
                //     style={{ pointerEvents: 'none' }}
                // >
                //     {/* Bring back pointer-events so that the popup can have clickable links */}
                //     <div style={{ pointerEvents: 'auto' }}>{popupContent}</div>
                // </Popover>
                <Popper anchorEl={popupAnchor} open={Boolean(popupAnchor)} placement="bottom">
                    <Paper>{popupContent}</Paper>
                </Popper>
            )}
        </div>
    );
}

export default withStyles(styles)(CourseInfoButton);

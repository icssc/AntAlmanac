import { Button, Paper, Popper, useMediaQuery } from '@material-ui/core';
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
    const [isClicked, setIsClicked] = useState(false);

    const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
        // If there is popup content, allow the content to be shown when the button is hovered
        // Note that on mobile devices, hovering is not possible, so the popup still needs to be able
        // to appear when the button is clicked
        if (popupContent) {
            logAnalytics({
                category: analyticsCategory,
                action: analyticsAction,
            });

            setPopupAnchor(event.currentTarget);
        }
    };

    const handleMouseLeave = () => {
        if (popupContent) {
            setIsClicked(false);
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
                        // This is mostly used for devices that don't support hovering
                        // and thus only support clicking to open/close the popup
                        // If isClicked is true, then the popup is currently visible; otherwise, if
                        // isClicked is false, then the popup is currently hidden
                        setPopupAnchor(isClicked ? null : event.currentTarget);
                        setIsClicked((prev) => !prev);
                    }
                }}
            >
                {text}
            </Button>

            {popupContent && (
                <Popper anchorEl={popupAnchor} open={Boolean(popupAnchor)} placement="bottom">
                    <Paper>{popupContent}</Paper>
                </Popper>
            )}
        </div>
    );
}

export default withStyles(styles)(CourseInfoButton);

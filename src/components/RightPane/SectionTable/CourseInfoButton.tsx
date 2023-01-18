import { Button, Popover , useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React, { useState } from 'react';

import { logAnalytics } from '../../../analytics';

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
    const isMobileScreen = useMediaQuery('(max-width: 750px)');
    return (
        <>
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
                <Popover
                    anchorEl={popupAnchor}
                    open={Boolean(popupAnchor)}
                    onClose={() => setPopupAnchor(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    {popupContent}
                </Popover>
            )}
        </>
    );
}

export default withStyles(styles)(CourseInfoButton);

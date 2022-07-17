import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { logAnalytics } from '../../../analytics';

const styles = {
    button: {
        backgroundColor: '#385EB1',
        color: '#fff',
    },
};

function CourseInfoButton({ classes, text, icon, redirectLink, popupContent, analyticsAction, analyticsCategory }) {
    const [popupAnchor, setPopupAnchor] = useState(null);
    const isMobileScreen = useMediaQuery('(max-width: 750px)');
    return (
        <>
            <Button
                className={classes.button}
                startIcon={!isMobileScreen && icon}
                variant="contained"
                size="small"
                onClick={(event) => {
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

CourseInfoButton.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.object,
    redirectLink: PropTypes.string,
    analyticsAction: PropTypes.string,
    analyticsCategory: PropTypes.string,
};

export default withStyles(styles)(CourseInfoButton);

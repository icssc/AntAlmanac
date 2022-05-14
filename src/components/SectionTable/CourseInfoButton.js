import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { logAnalytics } from '../../analytics';

const styles = {
    button: {
        backgroundColor: '#385EB1',
        color: '#fff',
    },
};

function CourseInfoButton({ classes, text, icon, redirectLink, anlyticsAction, analyticsCategory }) {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');
    return (
        <Button
            className={classes.button}
            startIcon={!isMobileScreen && icon}
            variant="contained"
            size="small"
            onClick={(event) => {
                logAnalytics({
                    category: analyticsCategory,
                    action: anlyticsAction,
                });
                window.open(redirectLink);
            }}
        >
            {text}
        </Button>
    );
}

CourseInfoButton.propTypes = {
    text: PropTypes.string,
    icon: PropTypes.object,
    redirectLink: PropTypes.string,
};

export default withStyles(styles)(CourseInfoButton);

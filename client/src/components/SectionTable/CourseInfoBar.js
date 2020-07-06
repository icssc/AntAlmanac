import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button, Popover } from '@material-ui/core';
import course_info from '../CoursePane/static/course_info.json';
import { MoreVert } from '@material-ui/icons';
import ReactGA from 'react-ga';
import { bindPopover, bindTrigger } from 'material-ui-popup-state/core';
import { usePopupState } from 'material-ui-popup-state/hooks';

const styles = (theme) => ({
    typography: {
        margin: theme.spacing.unit * 2,
    },
    button: {
        backgroundColor: '#72a9ed',
        boxShadow: 'none',
    },
    courseInfoPane: {
        margin: 10,
        maxWidth: 500,
    },
});

const CourseInfoBar = (props) => {
    const { classes, courseTitle, courseNumber, deptCode } = props;
    const popupState = usePopupState({ variant: 'popover' });

    return (
        <Fragment>
            <Button
                variant="contained"
                size="small"
                onClick={(event) => {
                    ReactGA.event({
                        category: 'Course_info',
                        action: `${deptCode} ${courseNumber}`,
                    });
                    popupState.toggle(event.currentTarget);
                }}
            >
                {`${deptCode} ${courseNumber} | ${courseTitle}`}
                <MoreVert fontSize="small" />
            </Button>
            <Popover
                {...bindPopover(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Typography className={classes.typography}>
                    <div
                        className={classes.courseInfoPane}
                        dangerouslySetInnerHTML={{
                            __html:
                                course_info[deptCode] === undefined
                                    ? ''
                                    : course_info[deptCode][courseNumber],
                        }}
                    />
                </Typography>
            </Popover>
        </Fragment>
    );
};

CourseInfoBar.propTypes = {
    classes: PropTypes.object.isRequired,
    courseTitle: PropTypes.string.isRequired,
    courseNumber: PropTypes.string.isRequired,
    deptCode: PropTypes.string.isRequired,
};

export default withStyles(styles)(CourseInfoBar);

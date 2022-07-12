import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, Popover, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { PETERPORTAL_REST_ENDPOINT } from '../../../api/endpoints';
import analyticsEnum, { logAnalytics } from '../../../analytics';

const styles = () => ({
    rightSpace: {
        marginRight: 4,
    },
    button: {
        backgroundColor: '#72a9ed',
        boxShadow: 'none',
    },
    courseInfoPane: {
        margin: 10,
        maxWidth: 500,
    },
    skeleton: {
        margin: 10,
        width: 500,
        height: 150,
    },
});

const noCourseInfo = {
    title: 'No description available',
    prerequisite_text: '',
    prerequisite_for: '',
    description: '',
    ge_list: '',
};

const CourseInfoBar = (props) => {
    const { courseTitle, courseNumber, deptCode, classes, analyticsCategory } = props;

    const [anchorEl, setAnchorEl] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);

    const togglePopover = async (currentTarget) => {
        if (Boolean(anchorEl)) {
            setAnchorEl(false);
        } else {
            setAnchorEl(currentTarget);

            if (courseInfo === null) {
                try {
                    const courseId = encodeURIComponent(
                        `${deptCode.replace(/\s/g, '')}${courseNumber.replace(/\s/g, '')}`
                    );
                    const response = await fetch(`${PETERPORTAL_REST_ENDPOINT}/courses/${courseId}`);

                    if (response.ok) {
                        const jsonResp = await response.json();

                        setCourseInfo({
                            title: jsonResp.title,
                            prerequisite_text: jsonResp.prerequisite_text,
                            prerequisite_for: jsonResp.prerequisite_for.join(', '),
                            description: jsonResp.description,
                            ge_list: jsonResp.ge_list.join(', '),
                        });
                    } else {
                        setCourseInfo(noCourseInfo);
                    }
                } catch (e) {
                    setCourseInfo(noCourseInfo);
                }
            }
        }
    };

    const getPopoverContent = () => {
        if (courseInfo === null) {
            return (
                <div className={classes.skeleton}>
                    <p>
                        <Skeleton variant="text" animation="wave" height={30} width="50%" />
                    </p>
                    <p>
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                    </p>
                </div>
            );
        } else {
            const { title, description, prerequisite_text, prerequisite_for, ge_list } = courseInfo;

            return (
                <div className={classes.courseInfoPane}>
                    <p>
                        <strong>{title}</strong>
                    </p>
                    <p>{description}</p>
                    {prerequisite_text !== '' && (
                        <p>
                            <span className={classes.rightSpace}>Prerequisites:</span>
                            {prerequisite_text}
                        </p>
                    )}
                    {prerequisite_for !== '' && (
                        <p>
                            <span className={classes.rightSpace}>Prerequisite for:</span>
                            {prerequisite_for}
                        </p>
                    )}
                    {ge_list !== '' && (
                        <p>
                            <span className={classes.rightSpace}>General Education Categories:</span>
                            {ge_list}
                        </p>
                    )}
                </div>
            );
        }
    };

    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    return (
        <>
            <Button
                variant="contained"
                startIcon={!isMobileScreen && <InfoOutlinedIcon />}
                size="small"
                onClick={(event) => {
                    logAnalytics({
                        category: analyticsCategory,
                        action: analyticsEnum.classSearch.actions.CLICK_INFO,
                    });
                    const currentTarget = event.currentTarget;
                    togglePopover(currentTarget);
                }}
            >
                {`${deptCode} ${courseNumber} | ${courseTitle}`}
            </Button>
            <Popover
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => togglePopover(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {getPopoverContent()}
            </Popover>
        </>
    );
};

CourseInfoBar.propTypes = {
    classes: PropTypes.object.isRequired,
    courseTitle: PropTypes.string.isRequired,
    courseNumber: PropTypes.string.isRequired,
    deptCode: PropTypes.string.isRequired,
};

export default withStyles(styles)(CourseInfoBar);

import { Button, Popover, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Skeleton } from '@material-ui/lab';
import { useState } from 'react';

import { RawResponse, Course, isErrorResponse } from 'peterportal-api-next-types';
import { MOBILE_BREAKPOINT } from '../../../globals';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { PETERPORTAL_REST_ENDPOINT } from '$lib/api/endpoints';

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

interface CourseInfoBarProps {
    courseTitle: string;
    courseNumber: string;
    deptCode: string;
    prerequisiteLink: string;
    classes: ClassNameMap;
    analyticsCategory: string;
}

interface CourseInfo {
    title: string;
    prerequisite_text: string;
    prerequisite_for: string;
    description: string;
    ge_list: string;
}

const CourseInfoBar = (props: CourseInfoBarProps) => {
    const { courseTitle, courseNumber, deptCode, prerequisiteLink, classes, analyticsCategory } = props;

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);

    const togglePopover = async (currentTarget: HTMLElement | null) => {
        if (anchorEl) {
            setAnchorEl(null);
        } else {
            setAnchorEl(currentTarget);

            if (courseInfo === null) {
                try {
                    const courseId = encodeURIComponent(
                        `${deptCode.replace(/\s/g, '')}${courseNumber.replace(/\s/g, '')}`
                    );
                    const res: RawResponse<Course> = await fetch(
                        `${PETERPORTAL_REST_ENDPOINT}/courses/${courseId}`
                    ).then((r) => r.json());

                    if (!isErrorResponse(res)) {
                        const data = res.payload;

                        setCourseInfo({
                            title: data.title,
                            prerequisite_text: data.prerequisiteText,
                            prerequisite_for: data.prerequisiteFor.join(', '),
                            description: data.description,
                            ge_list: data.geList.join(', '),
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
                            <a
                                onClick={() => {
                                    logAnalytics({
                                        category: analyticsCategory,
                                        action: analyticsEnum.classSearch.actions.CLICK_PREREQUISITES,
                                    });
                                }}
                                href={prerequisiteLink}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <span className={classes.rightSpace}>Prerequisites:</span>
                            </a>
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

    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

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
                    void togglePopover(currentTarget);
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

export default withStyles(styles)(CourseInfoBar);

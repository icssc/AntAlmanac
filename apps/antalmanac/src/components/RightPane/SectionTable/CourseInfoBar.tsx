import { Button, Popover, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Skeleton } from '@material-ui/lab';
import { useState } from 'react';

import { MOBILE_BREAKPOINT } from '../../../globals';

import PrereqTree from './PrereqTree';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { PETERPORTAL_REST_ENDPOINT } from '$lib/api/endpoints';
import { CourseResponse } from '$lib/peterportal.types';

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
    id: '',
    title: 'No description available',
    prerequisite_tree: '',
    prerequisite_list: [],
    prerequisite_text: '',
    prerequisite_for: [],
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

export interface CourseInfo {
    id: string;
    title: string;
    prerequisite_tree: string;
    prerequisite_list: string[];
    prerequisite_text: string;
    prerequisite_for: string[];
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
                    const response = await fetch(`${PETERPORTAL_REST_ENDPOINT}/courses/${courseId}`);

                    if (response.ok) {
                        const jsonResp = (await response.json()) as CourseResponse;
                        console.log(jsonResp.prerequisite_list);
                        setCourseInfo({
                            id: jsonResp.id,
                            title: jsonResp.title,
                            prerequisite_tree: jsonResp.prerequisite_tree,
                            prerequisite_list: jsonResp.prerequisite_list,
                            prerequisite_text: jsonResp.prerequisite_text,
                            prerequisite_for: jsonResp.prerequisite_for,
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
            const { title, prerequisite_tree, prerequisite_text, prerequisite_for, description, ge_list } = courseInfo;

            return (
                <div className={classes.courseInfoPane}>
                    <p>
                        <strong>{title}</strong>
                    </p>
                    <p>{description}</p>
                    {prerequisite_tree !== '' && <PrereqTree {...courseInfo} />}

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
                    {prerequisite_for.length !== 0 && (
                        <p>
                            <span className={classes.rightSpace}>Prerequisite for:</span>
                            {prerequisite_for.join(', ')}
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

import { Button, Popover, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Skeleton } from '@material-ui/lab';
import type { PrerequisiteTree } from '@packages/antalmanac-types';
import { useState } from 'react';

import { PrereqTree } from '$components/RightPane/SectionTable/prereq/PrereqTree';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import trpc from '$lib/api/trpc';
import { MOBILE_BREAKPOINT } from '$src/globals';

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
    department: '',
    courseNumber: '',
    title: 'No description available',
    prerequisite_tree: {},
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
    department: string;
    courseNumber: string;
    title: string;
    prerequisite_tree: PrerequisiteTree;
    prerequisite_list: string[];
    prerequisite_text: string;
    prerequisite_for: string[];
    description: string;
    ge_list: string;
}

export const CourseInfoBar = withStyles(styles)((props: CourseInfoBarProps) => {
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
                    const res = await trpc.course.get.query({
                        id: `${deptCode.replace(/\s/g, '')}${courseNumber.replace(/\s/g, '')}`,
                    });
                    if (res) {
                        setCourseInfo({
                            id: res.id,
                            department: res.department,
                            courseNumber: res.courseNumber,
                            title: res.title,
                            prerequisite_tree: res.prerequisiteTree,
                            prerequisite_list: res.prerequisites.map((x) => x.id),
                            prerequisite_text: res.prerequisiteText,
                            prerequisite_for: res.dependencies.map((x) => x.id),
                            description: res.description,
                            ge_list: res.geList.join(', '),
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
                    {JSON.stringify(prerequisite_tree) !== '{}' && <PrereqTree {...courseInfo} />}

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
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {`${deptCode} ${courseNumber} | ${courseTitle}`}
                </span>
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
});

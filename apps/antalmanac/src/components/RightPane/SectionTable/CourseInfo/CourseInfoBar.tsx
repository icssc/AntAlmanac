import { InfoOutlined } from '@mui/icons-material';
import { Box, Button, Popover, Skeleton } from '@mui/material';
import type { PrerequisiteTree } from '@packages/antalmanac-types';
import { useState } from 'react';

import PrereqTree from '$components/RightPane/SectionTable/PrereqTree';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import trpc from '$lib/api/trpc';

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

export const CourseInfoBar = ({
    courseTitle,
    courseNumber,
    deptCode,
    prerequisiteLink,
    analyticsCategory,
}: CourseInfoBarProps) => {
    const isMobile = useIsMobile();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);

    const togglePopover = async (currentTarget: HTMLElement | null) => {
        if (anchorEl) {
            setAnchorEl(null);
            return;
        }

        setAnchorEl(currentTarget);
        if (courseInfo !== null) {
            return;
        }

        try {
            const res = await trpc.course.get.query({
                id: `${deptCode.replace(/\s/g, '')}${courseNumber.replace(/\s/g, '')}`,
            });

            if (!res) {
                setCourseInfo(noCourseInfo);
                return;
            }

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
        } catch (e) {
            setCourseInfo(noCourseInfo);
        }
    };

    const getPopoverContent = () => {
        if (courseInfo === null) {
            return (
                <Box sx={{ margin: 1.5, width: 500, height: 150 }}>
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
                </Box>
            );
        } else {
            const { title, prerequisite_tree, prerequisite_text, prerequisite_for, description, ge_list } = courseInfo;

            return (
                <Box sx={{ margin: 1.5, maxWidth: 500 }}>
                    <p>
                        <strong>{title}</strong>
                    </p>
                    <p>{description}</p>
                    {Object.keys(prerequisite_tree).length > 0 && <PrereqTree {...courseInfo} />}

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
                                <span style={{ marginRight: 4 }}>Prerequisites:</span>
                            </a>
                            {prerequisite_text}
                        </p>
                    )}
                    {prerequisite_for.length !== 0 && (
                        <p>
                            <span style={{ marginRight: 4 }}>Prerequisite for:</span>
                            {prerequisite_for.join(', ')}
                        </p>
                    )}

                    {ge_list !== '' && (
                        <p>
                            <span style={{ marginRight: 4 }}>General Education Categories:</span>
                            {ge_list}
                        </p>
                    )}
                </Box>
            );
        }
    };

    return (
        <>
            <Button
                variant="contained"
                startIcon={!isMobile && <InfoOutlined />}
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
};

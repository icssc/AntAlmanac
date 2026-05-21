import PrereqTree from '$components/RightPane/SectionTable/PrereqTree';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum, { AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { trpc } from '$lib/api/trpc';
import { getAllSyllabiCourseIds, getPredecessorLabel } from '$lib/courseRenames';
import { InfoOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardHeader, Divider, Popover, Skeleton, Typography } from '@mui/material';
import type { PrerequisiteTree } from '@packages/anteater-api/types';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';

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
    analyticsCategory: AnalyticsCategory;
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

    const postHog = usePostHog();

    const predecessorLabel = getPredecessorLabel(deptCode, courseNumber);

    const fetchCourseInfo = async () => {
        const courseIds = getAllSyllabiCourseIds(`${deptCode.replace(/\s/g, '')}${courseNumber.replace(/\s/g, '')}`);

        for (const id of courseIds) {
            const res = await trpc.course.get.query({ id });
            if (!res) continue; // 404 — try next

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
            return;
        }

        setCourseInfo(noCourseInfo);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        logAnalytics(postHog, {
            category: analyticsCategory,
            action: analyticsEnum.classSearch.actions.CLICK_INFO,
        });
        const isOpening = !anchorEl;
        setAnchorEl(anchorEl ? null : event.currentTarget);
        if (isOpening && courseInfo === null) {
            void fetchCourseInfo();
        }
    };

    const getPopoverContent = () => {
        if (courseInfo === null) {
            return (
                <Card>
                    <CardContent sx={{ width: 500 }}>
                        <Skeleton variant="text" animation="wave" height={30} width="50%" />
                        <Box mt={1}>
                            <Skeleton variant="text" animation="wave" />
                            <Skeleton variant="text" animation="wave" />
                            <Skeleton variant="text" animation="wave" />
                            <Skeleton variant="text" animation="wave" />
                            <Skeleton variant="text" animation="wave" />
                        </Box>
                    </CardContent>
                </Card>
            );
        }

        const { title, prerequisite_tree, prerequisite_text, prerequisite_for, description, ge_list } = courseInfo;

        return (
            <Card>
                <CardHeader
                    title={`${deptCode} ${courseNumber} | ${title}`}
                    subheader={predecessorLabel ?? undefined}
                    slotProps={{
                        title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                    }}
                />
                <CardContent sx={{ maxWidth: 500, pt: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body1">{description}</Typography>
                    {(Object.keys(prerequisite_tree).length > 0 ||
                        prerequisite_text !== '' ||
                        prerequisite_for.length !== 0) && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Divider />
                            {Object.keys(prerequisite_tree).length > 0 && <PrereqTree {...courseInfo} />}
                            {prerequisite_text !== '' && (
                                <Typography variant="body1">
                                    <a
                                        onClick={() => {
                                            logAnalytics(postHog, {
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
                                </Typography>
                            )}
                            {prerequisite_for.length !== 0 && (
                                <Typography variant="body1">
                                    <span style={{ marginRight: 4 }}>Prerequisite for:</span>
                                    {prerequisite_for.join(', ')}
                                </Typography>
                            )}
                        </Box>
                    )}
                    {ge_list !== '' && (
                        <Typography variant="body1">
                            <span style={{ marginRight: 4 }}>General Education Categories:</span>
                            {ge_list}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Button
                variant="contained"
                color="secondary"
                startIcon={!isMobile && <InfoOutlined />}
                size="small"
                onClick={handleClick}
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {`${deptCode} ${courseNumber} | ${courseTitle}`}
                </span>
            </Button>

            <Popover
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                {getPopoverContent()}
            </Popover>
        </>
    );
};

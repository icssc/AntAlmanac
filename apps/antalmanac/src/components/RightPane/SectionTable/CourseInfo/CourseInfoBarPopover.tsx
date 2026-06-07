import PrereqTree from '$components/RightPane/SectionTable/CourseInfo/PrereqTree';
import analyticsEnum, { type AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { getRenamedCoursesLabel } from '$lib/renames/utils';
import { Box, Card, CardContent, CardHeader, Divider, Skeleton, Typography } from '@mui/material';
import type { Course } from '@packages/anteater-api/types';
import { usePostHog } from 'posthog-js/react';

interface CourseInfoBarPopoverProps {
    deptCode: string;
    courseNumber: string;
    prerequisiteLink: string;
    analyticsCategory: AnalyticsCategory;
    courseInfo?: Course;
    isLoading: boolean;
    isError: boolean;
}

export function CourseInfoBarPopover({
    deptCode,
    courseNumber,
    prerequisiteLink,
    analyticsCategory,
    courseInfo,
    isLoading,
    isError,
}: CourseInfoBarPopoverProps) {
    const postHog = usePostHog();
    const predecessorLabel = getRenamedCoursesLabel(deptCode, courseNumber);

    if (isLoading) {
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

    if (isError || !courseInfo) {
        return (
            <Card>
                <CardHeader
                    title={`${deptCode} ${courseNumber}`}
                    subheader={predecessorLabel ?? undefined}
                    slotProps={{
                        title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                    }}
                />
                <CardContent sx={{ maxWidth: 500, pt: 0 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                        No description available.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const { title, prerequisiteTree, prerequisiteText, dependencies, description, geList } = courseInfo;
    const geListLabel = geList.join(', ');

    return (
        <Card>
            <CardHeader
                title={`${deptCode} ${courseNumber}${title ? ` | ${title}` : ''}`}
                subheader={predecessorLabel ?? undefined}
                slotProps={{
                    title: { sx: { fontWeight: 500 }, variant: 'subtitle1' },
                }}
            />
            <CardContent sx={{ maxWidth: 500, pt: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!description && !Object.keys(prerequisiteTree).length && !geListLabel ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 1,
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            No description available.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Typography variant="body1">{description}</Typography>
                        {(Object.keys(prerequisiteTree).length > 0 ||
                            prerequisiteText !== '' ||
                            dependencies.length !== 0) && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Divider />
                                {Object.keys(prerequisiteTree).length > 0 && <PrereqTree course={courseInfo} />}
                                {prerequisiteText !== '' && (
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
                                        {prerequisiteText}
                                    </Typography>
                                )}
                                {dependencies.length !== 0 && (
                                    <Typography variant="body1">
                                        <span style={{ marginRight: 4 }}>Prerequisite for:</span>
                                        {dependencies.map((dependency) => dependency.id).join(', ')}
                                    </Typography>
                                )}
                            </Box>
                        )}
                        {geListLabel !== '' && (
                            <Typography variant="body1">
                                <span style={{ marginRight: 4 }}>General Education Categories:</span>
                                {geListLabel}
                            </Typography>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

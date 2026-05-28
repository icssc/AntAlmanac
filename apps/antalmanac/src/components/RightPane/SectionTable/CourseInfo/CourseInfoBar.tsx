import { CourseInfoBarPopover } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoBarPopover';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum, { AnalyticsCategory, logAnalytics } from '$lib/analytics/analytics';
import { trpcReact } from '$lib/api/trpc';
import { InfoOutlined } from '@mui/icons-material';
import { Button, Popover } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';

interface CourseInfoBarProps {
    courseTitle: string;
    courseNumber: string;
    deptCode: string;
    prerequisiteLink: string;
    analyticsCategory: AnalyticsCategory;
}

export const CourseInfoBar = ({
    courseTitle,
    courseNumber,
    deptCode,
    prerequisiteLink,
    analyticsCategory,
}: CourseInfoBarProps) => {
    const postHog = usePostHog();
    const isMobile = useIsMobile();

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const popoverOpen = Boolean(anchorEl);

    const {
        data: courseInfo,
        isLoading,
        isError,
    } = trpcReact.course.get.useQuery({ department: deptCode, courseNumber }, { enabled: popoverOpen });

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        logAnalytics(postHog, {
            category: analyticsCategory,
            action: analyticsEnum.classSearch.actions.CLICK_INFO,
        });
        setAnchorEl(anchorEl ? null : event.currentTarget);
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
                open={popoverOpen}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <CourseInfoBarPopover
                    deptCode={deptCode}
                    courseNumber={courseNumber}
                    prerequisiteLink={prerequisiteLink}
                    analyticsCategory={analyticsCategory}
                    courseInfo={courseInfo}
                    isLoading={isLoading}
                    isError={isError}
                />
            </Popover>
        </>
    );
};

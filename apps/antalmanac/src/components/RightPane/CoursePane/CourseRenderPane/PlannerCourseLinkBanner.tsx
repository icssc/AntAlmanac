import { DEFAULT_MANUAL_SEARCH_VALUES } from '$components/RightPane/CoursePane/SearchParams/defaults';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { BLUE } from '$src/globals';
import { Alert, Link } from '@mui/material';
import { buildCourseId } from '@packages/anteater-api/utils';

interface PlannerCourseLinkBannerProps {
    deptValue: string;
    courseNumber: string;
}

export function PlannerCourseLinkBanner({ deptValue, courseNumber }: PlannerCourseLinkBannerProps) {
    if (deptValue === DEFAULT_MANUAL_SEARCH_VALUES.deptValue || !courseNumber.trim()) {
        return null;
    }

    const multiSearchData = RightPaneStore.getMultiSearchData();

    if (multiSearchData.length > 0) {
        return null;
    }

    const courseId = buildCourseId(deptValue, courseNumber);
    const courseLabel = `${deptValue.trim()} ${courseNumber.trim()}`;

    return (
        <Link
            href={`https://antalmanac.com/planner/course/${encodeURIComponent(courseId)}`}
            target="_blank"
            sx={{ width: '100%' }}
        >
            <Alert
                variant="filled"
                severity="info"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    backgroundColor: BLUE,
                    color: 'white',
                }}
            >
                <span>
                    Search for <span style={{ textDecoration: 'underline' }}>{courseLabel}</span> on AntAlmanac Planner!
                </span>
            </Alert>
        </Link>
    );
}

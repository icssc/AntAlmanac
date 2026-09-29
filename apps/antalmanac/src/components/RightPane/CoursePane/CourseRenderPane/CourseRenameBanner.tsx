import { DEFAULT_MANUAL_SEARCH_VALUES } from '$components/RightPane/CoursePane/SearchParams/defaults';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { COURSE_RENAMES } from '$lib/renames/renames';
import { BLUE } from '$src/globals';
import { Alert, Button } from '@mui/material';

interface CourseRenameBannerProps {
    deptValue: string;
    courseNumber: string;
}

export function CourseRenameBanner({ deptValue, courseNumber }: CourseRenameBannerProps) {
    const [courseIds] = useCourseSearchParam('courseIds');

    const [, setDeptValue] = useCourseSearchParam('deptValue');
    const [, setCourseNumber] = useCourseSearchParam('courseNumber');

    if (deptValue === DEFAULT_MANUAL_SEARCH_VALUES.deptValue || !courseNumber) {
        return null;
    }

    if (courseIds.length > 0) {
        return null;
    }

    const courseLabel = `${deptValue} ${courseNumber}`;

    const courseRenameInfo = COURSE_RENAMES.find(
        (course) => course.previously.deptCode === deptValue && course.previously.courseNumber === courseNumber
    );

    if (!courseRenameInfo) {
        return null;
    }

    const newCourseLabel = `${courseRenameInfo.current.deptCode} ${courseRenameInfo.current.courseNumber}`;

    const navRename = () => {
        setDeptValue(courseRenameInfo.current.deptCode);
        setCourseNumber(courseRenameInfo.current.courseNumber);
    };

    return (
        <Button onClick={navRename} sx={{ width: '100%', padding: 0, textTransform: 'none' }}>
            <Alert
                variant="filled"
                severity="info"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    backgroundColor: BLUE,
                    color: 'white',
                    width: '100%',
                }}
            >
                <span>
                    {courseLabel} was renamed. Try searching for{' '}
                    <span style={{ textDecoration: 'underline' }}>{newCourseLabel}</span>
                </span>
            </Alert>
        </Button>
    );
}

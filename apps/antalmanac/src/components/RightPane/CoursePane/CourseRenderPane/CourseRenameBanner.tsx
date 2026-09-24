import { DEFAULT_MANUAL_SEARCH_VALUES } from '$components/RightPane/CoursePane/SearchParams/defaults';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import { COURSE_RENAMES } from '$lib/renames/renames';
import { BLUE } from '$src/globals';
import { Alert, Link } from '@mui/material';

interface CourseRenameBannerProps {
    deptValue: string;
    courseNumber: string;
}

export function CourseRenameBanner({ deptValue, courseNumber }: CourseRenameBannerProps) {
    const [courseIds] = useCourseSearchParam('courseIds');

    if (deptValue === DEFAULT_MANUAL_SEARCH_VALUES.deptValue || !courseNumber.trim()) {
        return null;
    }

    if (courseIds.length > 0) {
        return null;
    }

    const courseLabel = `${deptValue.trim()} ${courseNumber.trim()}`;

    const courseRenameInfo = COURSE_RENAMES.find(
        (course) => course.previously.deptCode === deptValue && course.previously.courseNumber === courseNumber
    );

    if (!courseRenameInfo) {
        console.log(deptValue);
        console.log(courseNumber);
        return null;
    }

    const newCourseLabel = `${courseRenameInfo.current.deptCode} ${courseRenameInfo.current.courseNumber}`;

    return (
        <Link
            href={`?search=manual&deptValue=${encodeURIComponent(courseRenameInfo.current.deptCode)}&courseNumber=${encodeURIComponent(courseRenameInfo.current.courseNumber)}&view=results`}
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
                    {courseLabel} was renamed. Try searching for{' '}
                    <span style={{ textDecoration: 'underline' }}>{newCourseLabel}</span>
                </span>
            </Alert>
        </Link>
    );
}

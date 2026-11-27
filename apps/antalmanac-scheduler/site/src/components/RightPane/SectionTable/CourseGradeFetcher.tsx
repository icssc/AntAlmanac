import { useFetchCourseGrades } from '$stores/CourseGradesStore';
import type { AACourse } from '@packages/antalmanac-types';

interface CourseGradeFetcherProps {
    course: AACourse;
}

export const CourseGradeFetcher = ({ course }: CourseGradeFetcherProps) => {
    useFetchCourseGrades(course);

    return null;
};

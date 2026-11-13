import { CourseGQLData } from '../../types/types';

export default function RepeatabilityText({ course }: { course: Pick<CourseGQLData, 'repeatability'> }) {
    return (
        <div className="course-repeatability">
            <h4>Repeatability</h4>
            <p>{course.repeatability?.trim() ? course.repeatability : 'This course cannot be repeated for credit.'}</p>
        </div>
    );
}

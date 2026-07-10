import { createPlannerCaller } from '$backend/planner/caller';
import { notFound } from 'next/navigation';

import CoursePage from '../CoursePage';

interface CoursePageParams {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CoursePageParams) {
    const id = decodeURIComponent((await params).id);

    const plannerCaller = await createPlannerCaller();
    const course = await plannerCaller.courses.get({ courseID: id });

    if (!course) return notFound();

    const title = `${course.department} ${course.courseNumber} | ${course.title}`;
    const description = course.description;

    return {
        title,
        description,
    };
}

const Page = async ({ params }: CoursePageParams) => {
    return <CoursePage courseId={decodeURIComponent((await params).id)} />;
};
export default Page;

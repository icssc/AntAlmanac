import { Metadata } from 'next';
import { headers } from 'next/headers';

import { createServerSideTrpcCaller } from '../../../trpc';
import CoursePage from '../CoursePage';

interface CoursePageParams {
    params: Promise<{ id: string }>;
}

const getCourse = async (id: string) => {
    const reqHeaders = await headers().then((h) => Object.fromEntries(h.entries()));
    const serverTrpc = createServerSideTrpcCaller(reqHeaders);
    return serverTrpc.courses.get.query({ courseID: id });
};

export async function generateMetadata({ params }: CoursePageParams): Promise<Metadata> {
    const id = decodeURIComponent((await params).id);

    const course = await getCourse(id);

    // CoursePage shows the not-found message
    if (!course) return {};

    const title = `${course.department} ${course.courseNumber} | ${course.title}`;
    const description = course.description;

    return {
        title,
        description,
    };
}

const Page = async ({ params }: CoursePageParams) => {
    const id = decodeURIComponent((await params).id);
    return <CoursePage courseId={id} coursePromise={getCourse(id)} />;
};
export default Page;

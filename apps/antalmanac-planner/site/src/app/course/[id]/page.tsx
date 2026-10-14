import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';

import { createServerSideTrpcCaller } from '../../../trpc';
import CoursePage from '../CoursePage';

interface CoursePageParams {
    params: Promise<{ id: string }>;
}

// shared by generateMetadata and Page so each request fetches once
const getCourse = cache(async (id: string) => {
    const reqHeaders = await headers().then((h) => Object.fromEntries(h.entries()));
    const serverTrpc = createServerSideTrpcCaller(reqHeaders);
    return serverTrpc.courses.get.query({ courseID: id });
});

export async function generateMetadata({ params }: CoursePageParams): Promise<Metadata> {
    const id = decodeURIComponent((await params).id);

    const course = await getCourse(id);

    // CourseNotFound shows the not-found page
    if (!course) return {};

    const title = `${course.department} ${course.courseNumber} | ${course.title}`;
    const description = course.description;

    return {
        title,
        description,
    };
}

const CourseNotFound = async ({ coursePromise }: { coursePromise: ReturnType<typeof getCourse> }) => {
    if (!(await coursePromise)) notFound();
    return null;
};

const Page = async ({ params }: CoursePageParams) => {
    const id = decodeURIComponent((await params).id);
    const coursePromise = getCourse(id);
    return (
        <>
            <CoursePage courseId={id} coursePromise={coursePromise} />
            <Suspense>
                <CourseNotFound coursePromise={coursePromise} />
            </Suspense>
        </>
    );
};
export default Page;

import CoursePage from '../CoursePage';
import { createServerSideTrpcCaller } from '../../../trpc';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

interface CoursePageParams {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CoursePageParams) {
  const id = decodeURIComponent((await params).id);

  const reqHeaders = await headers().then((h) => Object.fromEntries(h.entries()));
  const serverTrpc = createServerSideTrpcCaller(reqHeaders);
  const course = await serverTrpc.courses.get.query({ courseID: id });

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

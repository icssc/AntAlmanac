import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { createServerSideTrpcCaller } from '../../../trpc';
import ProfessorPage from '../ProfessorPage';

interface ProfessorPageParams {
    params: Promise<{ id: string }>;
}

// shared by generateMetadata and Page so each request fetches once
const getProfessor = cache(async (id: string) => {
    const reqHeaders = await headers().then((h) => Object.fromEntries(h.entries()));
    const serverTrpc = createServerSideTrpcCaller(reqHeaders);
    return serverTrpc.professors.get.query({ ucinetid: id });
});

export async function generateMetadata({ params }: ProfessorPageParams): Promise<Metadata> {
    const id = decodeURIComponent((await params).id);

    const professor = await getProfessor(id);

    if (!professor) return notFound();

    const title = professor.name;
    const description = `${professor.title} in ${professor.department}`;

    return {
        title,
        description,
    };
}

const Page = async ({ params }: ProfessorPageParams) => {
    const professor = await getProfessor(decodeURIComponent((await params).id));
    if (!professor) return notFound();

    return <ProfessorPage professor={professor} />;
};
export default Page;

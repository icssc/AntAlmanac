import { Metadata } from 'next';
import { headers } from 'next/headers';

import { createServerSideTrpcCaller } from '../../../trpc';
import ProfessorPage from '../ProfessorPage';

interface ProfessorPageParams {
    params: Promise<{ id: string }>;
}

const getProfessor = async (id: string) => {
    const reqHeaders = await headers().then((h) => Object.fromEntries(h.entries()));
    const serverTrpc = createServerSideTrpcCaller(reqHeaders);
    return serverTrpc.professors.get.query({ ucinetid: id });
};

export async function generateMetadata({ params }: ProfessorPageParams): Promise<Metadata> {
    const id = decodeURIComponent((await params).id);

    const professor = await getProfessor(id);

    // ProfessorPage shows the not-found message
    if (!professor) return {};

    const title = professor.name;
    const description = `${professor.title} in ${professor.department}`;

    return {
        title,
        description,
    };
}

const Page = async ({ params }: ProfessorPageParams) => {
    const id = decodeURIComponent((await params).id);
    return <ProfessorPage ucinetid={id} professorPromise={getProfessor(id)} />;
};
export default Page;

import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';

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

    // ProfessorNotFound shows the not-found page
    if (!professor) return {};

    const title = professor.name;
    const description = `${professor.title} in ${professor.department}`;

    return {
        title,
        description,
    };
}

const ProfessorNotFound = async ({ professorPromise }: { professorPromise: ReturnType<typeof getProfessor> }) => {
    if (!(await professorPromise)) notFound();
    return null;
};

const Page = async ({ params }: ProfessorPageParams) => {
    const id = decodeURIComponent((await params).id);
    const professorPromise = getProfessor(id);
    return (
        <>
            <ProfessorPage ucinetid={id} professorPromise={professorPromise} />
            <Suspense>
                <ProfessorNotFound professorPromise={professorPromise} />
            </Suspense>
        </>
    );
};
export default Page;

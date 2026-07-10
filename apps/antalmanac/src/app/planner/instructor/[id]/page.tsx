import { createPlannerCaller } from '$backend/planner/caller';
import { notFound } from 'next/navigation';

import ProfessorPage from '../ProfessorPage';

interface ProfessorPageParams {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProfessorPageParams) {
    const id = decodeURIComponent((await params).id);

    const plannerCaller = await createPlannerCaller();
    const professor = await plannerCaller.professors.get({ ucinetid: id });

    if (!professor) return notFound();

    const title = professor.name;
    const description = `${professor.title} in ${professor.department}`;

    return {
        title,
        description,
    };
}

const Page = async ({ params }: ProfessorPageParams) => {
    return <ProfessorPage ucinetid={decodeURIComponent((await params).id)} />;
};
export default Page;

'use client';
import Error from '$planner/component/Error/Error';
import GradeDist from '$planner/component/GradeDist/GradeDist';
import LoadingSpinner from '$planner/component/LoadingSpinner/LoadingSpinner';
import ResultPageContent, { ResultPageSection } from '$planner/component/ResultPageContent/ResultPageContent';
import Review from '$planner/component/Review/Review';
import Schedule from '$planner/component/Schedule/Schedule';
import SideInfo from '$planner/component/SideInfo/SideInfo';
import { getProfessorTerms } from '$planner/helpers/reviews';
import { sortTerms, unionTerms } from '$planner/helpers/util';
import { useProfessorData } from '$planner/hooks/professorReviews';
import { type FC, useEffect, useState } from 'react';

interface ProfessorPageProps {
    ucinetid: string;
}

const ProfessorPage: FC<ProfessorPageProps> = ({ ucinetid: id }) => {
    const professorGQLData = useProfessorData(id);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id === undefined) return;
        if (professorGQLData) {
            setError('');
            document.title = `${professorGQLData.name} | AntAlmanac Planner`;
        }
    }, [id, professorGQLData]);

    // if professor does not exists
    if (error) {
        return <Error message={error} />;
    }
    // loading results
    else if (!professorGQLData) {
        return <LoadingSpinner />;
    } else {
        const sideInfo = (
            <SideInfo
                searchType="instructor"
                name={professorGQLData.name}
                title={professorGQLData.title}
                description={professorGQLData.department}
                tags={[professorGQLData.ucinetid, ...professorGQLData.shortenedNames]}
                professor={professorGQLData}
            />
        );
        return (
            <ResultPageContent sideInfo={sideInfo}>
                <ResultPageSection title="📊 Grade Distribution">
                    <GradeDist professor={professorGQLData} />
                </ResultPageSection>

                <ResultPageSection title="🗓️ Schedule of Classes">
                    <Schedule
                        professorIDs={professorGQLData.shortenedNames}
                        termsOffered={unionTerms(professorGQLData.courses)}
                    />
                </ResultPageSection>

                <ResultPageSection title="💬 Reviews">
                    <Review professor={professorGQLData} terms={sortTerms(getProfessorTerms(professorGQLData))} />
                </ResultPageSection>
            </ResultPageContent>
        );
    }
};

export default ProfessorPage;

'use client';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { FC, useState, useEffect } from 'react';

import Error from '../../component/Error/Error';
import GradeDist from '../../component/GradeDist/GradeDist';
import LoadingSpinner from '../../component/LoadingSpinner/LoadingSpinner';
import ResultPageContent, { ResultPageSection } from '../../component/ResultPageContent/ResultPageContent';
import Review from '../../component/Review/Review';
import Schedule from '../../component/Schedule/Schedule';
import SideInfo from '../../component/SideInfo/SideInfo';
import { getProfessorTerms } from '../../helpers/reviews';
import { unionTerms, sortTerms } from '../../helpers/util';
import { useProfessorData } from '../../hooks/professorReviews';

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
                <ResultPageSection icon={<BarChartIcon />} title="Grade Distribution">
                    <GradeDist professor={professorGQLData} />
                </ResultPageSection>

                <ResultPageSection icon={<CalendarTodayIcon />} title="Schedule of Classes">
                    <Schedule
                        professorIDs={professorGQLData.shortenedNames}
                        termsOffered={unionTerms(professorGQLData.courses)}
                    />
                </ResultPageSection>

                <ResultPageSection icon={<RateReviewIcon />} title="Reviews">
                    <Review professor={professorGQLData} terms={sortTerms(getProfessorTerms(professorGQLData))} />
                </ResultPageSection>
            </ResultPageContent>
        );
    }
};

export default ProfessorPage;

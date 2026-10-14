'use client';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { ProfessorAAPIResponse } from '@peterportal/types';
import { FC, useState, useEffect } from 'react';

import Error from '../../component/Error/Error';
import GradeDist from '../../component/GradeDist/GradeDist';
import ResultPageContent, { ResultPageSection } from '../../component/ResultPageContent/ResultPageContent';
import Review from '../../component/Review/Review';
import Schedule from '../../component/Schedule/Schedule';
import SideInfo from '../../component/SideInfo/SideInfo';
import { getProfessorTerms } from '../../helpers/reviews';
import { unionTerms, sortTerms } from '../../helpers/util';
import { useProfessorData } from '../../hooks/professorReviews';

// typical lengths so the skeleton is about the size of a real professor page
const LOADING_SIDE_INFO = {
    name: 'Firstname Lastname',
    title: 'Professor of Teaching',
    description: 'Computer Science',
};

interface ProfessorPageProps {
    ucinetid: string;
    professorPromise: Promise<ProfessorAAPIResponse | null>;
}

const ProfessorPage: FC<ProfessorPageProps> = ({ ucinetid: id, professorPromise }) => {
    const professorGQLData = useProfessorData(id, professorPromise);
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
        return (
            <ResultPageContent
                sideInfo={
                    <SideInfo skeleton searchType="instructor" {...LOADING_SIDE_INFO} tags={[id, 'LASTNAME, F.']} />
                }
            >
                <ResultPageSection icon={<BarChartIcon />} title="Grade Distribution">
                    <GradeDist skeleton />
                </ResultPageSection>
                <ResultPageSection icon={<CalendarTodayIcon />} title="Schedule of Classes">
                    <Schedule skeleton />
                </ResultPageSection>
                <ResultPageSection icon={<RateReviewIcon />} title="Reviews">
                    <Review skeleton />
                </ResultPageSection>
            </ResultPageContent>
        );
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
                        key={professorGQLData.ucinetid}
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

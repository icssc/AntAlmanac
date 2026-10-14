'use client';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { ProfessorAAPIResponse } from '@peterportal/types';
import { FC, Suspense, useEffect } from 'react';

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

const ProfessorSkeleton: FC<{ ucinetid: string }> = ({ ucinetid }) => (
    <ResultPageContent
        sideInfo={
            <SideInfo skeleton searchType="instructor" {...LOADING_SIDE_INFO} tags={[ucinetid, 'LASTNAME, F.']} />
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

const ProfessorContent: FC<ProfessorPageProps> = ({ ucinetid, professorPromise }) => {
    const professorGQLData = useProfessorData(ucinetid, professorPromise);

    useEffect(() => {
        if (professorGQLData) document.title = `${professorGQLData.name} | AntAlmanac Planner`;
    }, [professorGQLData]);

    // the server found no professor and its not-found page replaces this
    if (!professorGQLData) return <ProfessorSkeleton ucinetid={ucinetid} />;

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
};

const ProfessorPage: FC<ProfessorPageProps> = (props) => (
    <Suspense fallback={<ProfessorSkeleton ucinetid={props.ucinetid} />}>
        <ProfessorContent {...props} />
    </Suspense>
);

export default ProfessorPage;

'use client';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { ProfessorAAPIResponse } from '@peterportal/types';
import { FC, useEffect, useMemo } from 'react';

import GradeDist from '../../component/GradeDist/GradeDist';
import ResultPageContent, { ResultPageSection } from '../../component/ResultPageContent/ResultPageContent';
import Review from '../../component/Review/Review';
import Schedule from '../../component/Schedule/Schedule';
import SideInfo from '../../component/SideInfo/SideInfo';
import { getProfessorTerms } from '../../helpers/reviews';
import { unionTerms, sortTerms, transformProfessorGQL } from '../../helpers/util';
import { useAppDispatch } from '../../store/hooks';
import { setProfessor } from '../../store/slices/professorSlice';

interface ProfessorPageProps {
    professor: ProfessorAAPIResponse;
}

const ProfessorPage: FC<ProfessorPageProps> = ({ professor }) => {
    const dispatch = useAppDispatch();
    const professorGQLData = useMemo(() => transformProfessorGQL(professor), [professor]);

    useEffect(() => {
        dispatch(setProfessor({ professorId: professorGQLData.ucinetid, data: professorGQLData }));
        document.title = `${professorGQLData.name} | AntAlmanac Planner`;
    }, [professorGQLData, dispatch]);

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

export default ProfessorPage;

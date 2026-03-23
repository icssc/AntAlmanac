'use client';
import { FC, useState, useEffect } from 'react';
import LoadingSpinner from '../../component/LoadingSpinner/LoadingSpinner';
import Schedule from '../../component/Schedule/Schedule';
import Review from '../../component/Review/Review';
import GradeDist from '../../component/GradeDist/GradeDist';
import SideInfo from '../../component/SideInfo/SideInfo';
import Error from '../../component/Error/Error';

import { unionTerms, sortTerms } from '../../helpers/util';
import { getProfessorTerms } from '../../helpers/reviews';
import ResultPageContent, { ResultPageSection } from '../../component/ResultPageContent/ResultPageContent';
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

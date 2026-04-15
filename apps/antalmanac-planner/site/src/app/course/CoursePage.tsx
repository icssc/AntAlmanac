'use client';
import { FC, useState, useEffect } from 'react';
import LoadingSpinner from '../../component/LoadingSpinner/LoadingSpinner';

import GradeDist from '../../component/GradeDist/GradeDist';
import PrereqTree from '../../component/PrereqTree/PrereqTree';
import Schedule from '../../component/Schedule/Schedule';
import Review from '../../component/Review/Review';
import SideInfo from '../../component/SideInfo/SideInfo';
import Error from '../../component/Error/Error';

import { useAppDispatch } from '../../store/hooks';
import { getCourseTags, sortTerms } from '../../helpers/util';
import ResultPageContent, { ResultPageSection } from '../../component/ResultPageContent/ResultPageContent';
import { useCourseData } from '../../hooks/catalog';

interface CoursePageProps {
  courseId: string;
}

const CoursePage: FC<CoursePageProps> = ({ courseId: id }) => {
  const dispatch = useAppDispatch();
  const courseGQLData = useCourseData(id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id === undefined) return;
    if (courseGQLData) {
      setError('');
      document.title = `${courseGQLData.department + ' ' + courseGQLData.courseNumber} | AntAlmanac Planner`;
    }
  }, [courseGQLData, dispatch, id]);

  // if course does not exists
  if (error) {
    return <Error message={error} />;
  }
  // loading results
  else if (!courseGQLData) {
    return <LoadingSpinner />;
  } else {
    const sideInfo = (
      <SideInfo
        searchType="course"
        name={courseGQLData.department + ' ' + courseGQLData.courseNumber}
        title={courseGQLData.title}
        description={courseGQLData.description}
        tags={getCourseTags(courseGQLData)}
        course={courseGQLData}
        terms={courseGQLData.terms}
      />
    );
    return (
      <ResultPageContent sideInfo={sideInfo}>
        <ResultPageSection title="📊 Grade Distribution">
          <GradeDist course={courseGQLData} />
        </ResultPageSection>

        <ResultPageSection title="🌲 Prerequisite Tree">
          <PrereqTree key={courseGQLData.id} {...courseGQLData} />
        </ResultPageSection>

        <ResultPageSection title="🗓️ Schedule of Classes">
          <Schedule
            key={courseGQLData.id}
            courseID={courseGQLData.department + ' ' + courseGQLData.courseNumber}
            termsOffered={sortTerms(courseGQLData.terms)}
          />
        </ResultPageSection>

        <ResultPageSection title="💬 Reviews">
          <Review key={courseGQLData.id} course={courseGQLData} terms={sortTerms(courseGQLData.terms)} />
        </ResultPageSection>
      </ResultPageContent>
    );
  }
};

export default CoursePage;

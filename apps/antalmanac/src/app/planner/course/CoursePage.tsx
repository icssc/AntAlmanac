'use client';
import Error from '$planner/component/Error/Error';
import GradeDist from '$planner/component/GradeDist/GradeDist';
import LoadingSpinner from '$planner/component/LoadingSpinner/LoadingSpinner';
import PrereqTree from '$planner/component/PrereqTree/PrereqTree';
import ResultPageContent, { ResultPageSection } from '$planner/component/ResultPageContent/ResultPageContent';
import Review from '$planner/component/Review/Review';
import Schedule from '$planner/component/Schedule/Schedule';
import SideInfo from '$planner/component/SideInfo/SideInfo';
import { getCourseTags, sortTerms } from '$planner/helpers/util';
import { useCourseData } from '$planner/hooks/catalog';
import { useAppDispatch } from '$planner/store/hooks';
import { type FC, useEffect, useState } from 'react';

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

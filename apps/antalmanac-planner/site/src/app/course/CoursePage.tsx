'use client';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { FC, useState, useEffect } from 'react';

import Error from '../../component/Error/Error';
import GradeDist from '../../component/GradeDist/GradeDist';
import PrereqTree from '../../component/PrereqTree/PrereqTree';
import ResultPageContent, { ResultPageSection } from '../../component/ResultPageContent/ResultPageContent';
import Review from '../../component/Review/Review';
import Schedule from '../../component/Schedule/Schedule';
import SideInfo from '../../component/SideInfo/SideInfo';
import { LOADING_COURSE_PLACEHOLDER } from '../../helpers/courseRequirements';
import { getCourseTags, sortTerms } from '../../helpers/util';
import { useCourseData } from '../../hooks/catalog';
import { useAppDispatch } from '../../store/hooks';

// typical lengths so the skeleton is about the size of a real professor page
const currentYear = new Date().getFullYear();
const LOADING_SIDE_INFO = {
    title: 'Design and Analysis of Algorithms',
    description:
        'Techniques for efficient algorithm design, including divide-and-conquer and dynamic programming, and time and space analysis of algorithms. Data structures, graph algorithms, and the theory of NP-completeness.',
    tags: ['4 units', 'Upper Division'],
    terms: [0, 1, 2, 3].map((yearsAgo) => `${currentYear - yearsAgo} Fall`),
};

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
    else if (courseGQLData.id === LOADING_COURSE_PLACEHOLDER.id) {
        return (
            <ResultPageContent sideInfo={<SideInfo skeleton searchType="course" name={id} {...LOADING_SIDE_INFO} />}>
                <ResultPageSection icon={<BarChartIcon />} title="Grade Distribution">
                    <GradeDist skeleton />
                </ResultPageSection>
            </ResultPageContent>
        );
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
                <ResultPageSection icon={<BarChartIcon />} title="Grade Distribution">
                    <GradeDist course={courseGQLData} />
                </ResultPageSection>

                <ResultPageSection icon={<AccountTreeIcon />} title="Prerequisite Tree">
                    <PrereqTree key={courseGQLData.id} {...courseGQLData} />
                </ResultPageSection>

                <ResultPageSection icon={<CalendarTodayIcon />} title="Schedule of Classes">
                    <Schedule
                        key={courseGQLData.id}
                        courseID={courseGQLData.department + ' ' + courseGQLData.courseNumber}
                        termsOffered={sortTerms(courseGQLData.terms)}
                    />
                </ResultPageSection>

                <ResultPageSection icon={<RateReviewIcon />} title="Reviews">
                    <Review key={courseGQLData.id} course={courseGQLData} terms={sortTerms(courseGQLData.terms)} />
                </ResultPageSection>
            </ResultPageContent>
        );
    }
};

export default CoursePage;

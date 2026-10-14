'use client';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { CourseAAPIResponse } from '@peterportal/types';
import { FC, Suspense, useEffect } from 'react';

import GradeDist from '../../component/GradeDist/GradeDist';
import PrereqTree from '../../component/PrereqTree/PrereqTree';
import ResultPageContent, { ResultPageSection } from '../../component/ResultPageContent/ResultPageContent';
import Review from '../../component/Review/Review';
import Schedule from '../../component/Schedule/Schedule';
import SideInfo from '../../component/SideInfo/SideInfo';
import { LOADING_COURSE_PLACEHOLDER } from '../../helpers/courseRequirements';
import { getCourseTags, sortTerms } from '../../helpers/util';
import { useCourseData } from '../../hooks/catalog';

// typical lengths so the skeleton is about the size of a real course page
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
    coursePromise: Promise<CourseAAPIResponse | null>;
}

const CourseSkeleton: FC<{ courseId: string }> = ({ courseId }) => (
    <ResultPageContent sideInfo={<SideInfo skeleton searchType="course" name={courseId} {...LOADING_SIDE_INFO} />}>
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

const CourseContent: FC<CoursePageProps> = ({ courseId, coursePromise }) => {
    const courseGQLData = useCourseData(courseId, coursePromise);

    useEffect(() => {
        document.title = `${courseGQLData.department + ' ' + courseGQLData.courseNumber} | AntAlmanac Planner`;
    }, [courseGQLData]);

    // the server found no course and its not-found page replaces this
    if (courseGQLData.id === LOADING_COURSE_PLACEHOLDER.id) return <CourseSkeleton courseId={courseId} />;

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
};

const CoursePage: FC<CoursePageProps> = (props) => (
    <Suspense fallback={<CourseSkeleton courseId={props.courseId} />}>
        <CourseContent {...props} />
    </Suspense>
);

export default CoursePage;

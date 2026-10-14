'use client';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { CourseAAPIResponse } from '@peterportal/types';
import { FC, useEffect, useMemo } from 'react';

import GradeDist from '../../component/GradeDist/GradeDist';
import PrereqTree from '../../component/PrereqTree/PrereqTree';
import ResultPageContent, { ResultPageSection } from '../../component/ResultPageContent/ResultPageContent';
import Review from '../../component/Review/Review';
import Schedule from '../../component/Schedule/Schedule';
import SideInfo from '../../component/SideInfo/SideInfo';
import { getCourseTags, sortTerms, transformCourseGQL } from '../../helpers/util';
import { useAppDispatch } from '../../store/hooks';
import { setCourse } from '../../store/slices/courseCatalogSlice';

interface CoursePageProps {
    course: CourseAAPIResponse;
}

const CoursePage: FC<CoursePageProps> = ({ course }) => {
    const dispatch = useAppDispatch();
    const courseGQLData = useMemo(() => transformCourseGQL(course), [course]);

    useEffect(() => {
        dispatch(setCourse({ courseId: courseGQLData.id, data: courseGQLData }));
        document.title = `${courseGQLData.department + ' ' + courseGQLData.courseNumber} | AntAlmanac Planner`;
    }, [courseGQLData, dispatch]);

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

export default CoursePage;

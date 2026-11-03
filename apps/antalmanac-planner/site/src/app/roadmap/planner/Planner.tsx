'use client';
import { FC } from 'react';

import './Planner.scss';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import { totalEnrollmentCredit } from '../../../helpers/repeatability';
import { getTotalUnitsFromTransfers } from '../../../helpers/transferCredits';
import { useCourseCredits } from '../../../hooks/courseCredits';
import { useTransferredCredits } from '../../../hooks/transferCredits';
import Footer from '../../../shared-components/Footer';
import { useAppSelector } from '../../../store/hooks';
import { selectYearPlans } from '../../../store/slices/roadmapSlice';
import Disclaimer from '../Disclaimer/Disclaimer';
import QuarterInfo from '../QuarterInfo/QuarterInfo';
import Header from '../toolbar/Header';
import Year from './Year';

const Planner: FC = () => {
    const currentPlanData = useAppSelector(selectYearPlans);
    const roadmapLoading = useAppSelector((state) => state.roadmap.roadmapLoading);
    const transferred = useTransferredCredits();

    const credits = useCourseCredits().enrollments;
    const customCourses = currentPlanData
        .flatMap((year) => year.quarters)
        .flatMap((quarter) => quarter.courses)
        .filter((course) => 'courseName' in course);
    const credited = totalEnrollmentCredit(credits);
    const courseCount = credited.courseCount + customCourses.length;
    const unitCount =
        credited.unitCount +
        customCourses.reduce((sum, course) => sum + course.units, 0) +
        getTotalUnitsFromTransfers([], transferred.ap, transferred.ge, transferred.other);

    const quarterCounts = currentPlanData.map((years) => years.quarters.length);
    const maxQuarterCount = Math.max(...quarterCounts);

    return (
        <div className="planner">
            <Header courseCount={courseCount} unitCount={unitCount} missingPrerequisites={new Set()} />
            {roadmapLoading ? (
                <LoadingSpinner />
            ) : (
                <section className="years" data-max-quarter-count={maxQuarterCount}>
                    {currentPlanData.map((year, yearIndex) => {
                        return <Year key={yearIndex} yearIndex={yearIndex} data={year} />;
                    })}
                </section>
            )}

            <div className="app-footer">
                <Footer />
                <QuarterInfo />
                <Disclaimer />
            </div>
        </div>
    );
};

export default Planner;

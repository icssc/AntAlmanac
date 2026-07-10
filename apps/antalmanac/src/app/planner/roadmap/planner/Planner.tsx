'use client';
import LoadingSpinner from '$planner/component/LoadingSpinner/LoadingSpinner';

import './Planner.scss';
import { calculateTotalUnits } from '$planner/helpers/planner';
import { getTotalUnitsFromTransfers } from '$planner/helpers/transferCredits';
import { useTransferredCredits } from '$planner/hooks/transferCredits';
import Footer from '$planner/shared-components/Footer';
import { useAppSelector } from '$planner/store/hooks';
import { selectYearPlans } from '$planner/store/slices/roadmapSlice';
import { type PlannerQuarterCourse } from '$planner/types/types';
import { type FC } from 'react';

import Disclaimer from '../Disclaimer/Disclaimer';
import QuarterInfo from '../QuarterInfo/QuarterInfo';
import Header from '../toolbar/Header';
import Year from './Year';

const Planner: FC = () => {
    const currentPlanData = useAppSelector(selectYearPlans);
    const roadmapLoading = useAppSelector((state) => state.roadmap.roadmapLoading);
    const transferred = useTransferredCredits();

    const calculatePlannerOverviewStats = () => {
        // sum up all courses
        const courses: PlannerQuarterCourse[] = currentPlanData
            .flatMap((year) => year.quarters)
            .flatMap((q) => q.courses);

        let { unitCount, courseCount } = calculateTotalUnits(courses);

        // add in transfer courses
        courseCount += transferred.courses.length;
        unitCount += getTotalUnitsFromTransfers(transferred.courses, transferred.ap, transferred.ge, transferred.other);
        return { unitCount, courseCount };
    };

    const { unitCount, courseCount } = calculatePlannerOverviewStats();

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

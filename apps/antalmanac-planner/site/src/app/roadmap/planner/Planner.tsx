'use client';
import dynamic from 'next/dynamic';
import { FC, useEffect } from 'react';

import './Planner.scss';
import { isCustomCourse } from '../../../helpers/customCourses';
import { calculateTotalUnits, setLocalSkeletonBlueprint } from '../../../helpers/planner';
import { getTotalUnitsFromTransfers } from '../../../helpers/transferCredits';
import { useTransferredCredits } from '../../../hooks/transferCredits';
import Footer from '../../../shared-components/Footer';
import { useAppSelector } from '../../../store/hooks';
import { selectYearPlans } from '../../../store/slices/roadmapSlice';
import { PlannerQuarterCourse, PlannerYearData } from '../../../types/types';
import Disclaimer from '../Disclaimer/Disclaimer';
import QuarterInfo from '../QuarterInfo/QuarterInfo';
import Header from '../toolbar/Header';
import Year from './Year';

const RoadmapLoadingSkeleton = dynamic(() => import('./RoadmapLoadingSkeleton'), { ssr: false });

function slimCourse(course: PlannerQuarterCourse): PlannerQuarterCourse {
    if (isCustomCourse(course)) return course;
    return {
        ...course,
        description: '',
        prerequisiteText: '',
        prerequisiteTree: {},
        restriction: '',
        instructors: {},
        prerequisites: {},
        dependents: {},
    };
}

function persistSkeletonBlueprint(yearPlans: PlannerYearData[]) {
    const slim = yearPlans.map((year) => ({
        ...year,
        quarters: year.quarters.map((quarter) => ({ ...quarter, courses: quarter.courses.map(slimCourse) })),
    }));
    setLocalSkeletonBlueprint(JSON.stringify(slim));
}

const Planner: FC = () => {
    const currentPlanData = useAppSelector(selectYearPlans);
    const roadmapLoading = useAppSelector((state) => state.roadmap.roadmapLoading);
    const transferred = useTransferredCredits();

    useEffect(() => {
        if (!roadmapLoading) persistSkeletonBlueprint(currentPlanData);
    }, [currentPlanData, roadmapLoading]);

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
                <RoadmapLoadingSkeleton />
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

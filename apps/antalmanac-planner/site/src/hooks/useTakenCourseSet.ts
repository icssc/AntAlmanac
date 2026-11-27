import { CompletedCourseSet } from '../helpers/courseRequirements';
import { isCustomCourse } from '../helpers/customCourses';
import { useAppSelector } from '../store/hooks';
import { PlannerCourseData } from '../types/types';
import { useTransferredCredits } from './transferCredits';

export function useTakenCourseSet() {
    const transferredCourses = useTransferredCredits().courses;
    const roadmapPlans = useAppSelector((state) => state.roadmap.plans);
    const roadmapPlanIndex = useAppSelector((state) => state.roadmap.currentPlanIndex);
    const yearPlans = roadmapPlans[roadmapPlanIndex].content.yearPlans;

    const roadmapCourseMap = yearPlans
        .flatMap((year) => year.quarters)
        .flatMap((quarter) => quarter.courses)
        .filter((course): course is PlannerCourseData => !isCustomCourse(course))
        .map((course) => [course.id, { units: course.minUnits }]);
    const transferCourseMap = transferredCourses.map((t) => [
        t.courseName.replace(/\s/g, ''),
        { units: t.units ?? 0, transferType: t.transferType },
    ]);

    const takenCourseSet: CompletedCourseSet = Object.assign(
        {},
        Object.fromEntries(roadmapCourseMap),
        Object.fromEntries(transferCourseMap)
    );

    return takenCourseSet;
}

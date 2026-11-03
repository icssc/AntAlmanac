import { createContext, ReactNode, useContext, useMemo } from 'react';

import {
    buildCourseEnrollments,
    completedCoursesFromCredits,
    EnrollmentCredit,
    evaluateRepeatability,
} from '../helpers/repeatability';
import { useAppSelector } from '../store/hooks';
import { selectCurrentPlan } from '../store/slices/roadmapSlice';
import { useTransferredCredits } from './transferCredits';

interface CourseCredits {
    enrollments: EnrollmentCredit[];
    byId: Map<string, EnrollmentCredit>;
    completed: ReturnType<typeof completedCoursesFromCredits>;
}
const CourseCreditsContext = createContext<CourseCredits | null>(null);

/** One shared evaluation supplies cards, course lists, and totals for the active plan. */
export function CourseCreditsProvider({ children }: { children: ReactNode }) {
    const years = useAppSelector(selectCurrentPlan)?.content.yearPlans;
    const transferred = useTransferredCredits().courses;
    const value = useMemo(() => {
        const enrollments = evaluateRepeatability(buildCourseEnrollments(years ?? [], transferred));
        return {
            enrollments,
            byId: new Map(enrollments.map((enrollment) => [enrollment.id, enrollment])),
            completed: completedCoursesFromCredits(enrollments),
        };
    }, [years, transferred]);
    return <CourseCreditsContext.Provider value={value}>{children}</CourseCreditsContext.Provider>;
}

export function useCourseCredits() {
    const credits = useContext(CourseCreditsContext);
    if (!credits) throw new Error('Course credit consumers must be inside CourseCreditsProvider');
    return credits;
}

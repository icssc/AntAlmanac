import { quarters } from '@peterportal/types';

import type { PlannerCourseData, PlannerYearData } from '../types/types';
import type { CompletedCourseSet } from './courseRequirements';

export interface CourseEnrollment {
    /** Occurrence identity; multiple enrollments may have the same courseId. */
    id: string;
    courseId: string;
    source: 'roadmap' | 'transfer';
    units: number;
    countsForCredit?: boolean;
    repeatabilityTimes?: number | null;
    repeatabilityType?: 'times' | 'credit_hours' | null;
    transferType?: 'AP' | 'Course';
}

export interface EnrollmentCredit extends CourseEnrollment {
    automaticallyCountsForCredit: boolean;
    eligible: boolean;
    creditedUnits: number;
    overLimit: boolean;
}

/** Evaluate enrollments in priority order, without changing the saved override or catalog data. */
export function evaluateRepeatability(enrollments: CourseEnrollment[]): EnrollmentCredit[] {
    const used = new Map<string, { times: number; units: number }>();
    return enrollments.map((enrollment) => {
        const units = Math.max(0, enrollment.units);
        const previous = used.get(enrollment.courseId) ?? { times: 0, units: 0 };
        const limit = enrollment.repeatabilityTimes;
        let automaticallyCountsForCredit = true;
        let automaticUnits = units;
        if (limit !== null) {
            if (enrollment.repeatabilityType === 'credit_hours' && limit !== undefined) {
                automaticUnits = Math.min(units, Math.max(0, limit - previous.units));
                automaticallyCountsForCredit = automaticUnits > 0 || units === 0;
            } else {
                // The API uses zero for non-repeatable courses. Positive limits include the first take.
                // Missing metadata conservatively permits one credit-bearing enrollment.
                automaticallyCountsForCredit = previous.times < Math.max(1, limit ?? 1);
                automaticUnits = automaticallyCountsForCredit ? units : 0;
            }
        }
        const eligible = enrollment.countsForCredit ?? automaticallyCountsForCredit;
        const creditedUnits = !eligible ? 0 : enrollment.countsForCredit === true ? units : automaticUnits;
        const overLimit =
            enrollment.countsForCredit !== false && (!automaticallyCountsForCredit || automaticUnits < units);
        if (eligible)
            used.set(enrollment.courseId, {
                times: previous.times + 1,
                units: previous.units + creditedUnits,
            });
        return { ...enrollment, automaticallyCountsForCredit, eligible, creditedUnits, overLimit };
    });
}

export function roadmapEnrollmentId(yearIndex: number, quarterIndex: number, courseIndex: number) {
    return `roadmap:${yearIndex}:${quarterIndex}:${courseIndex}`;
}

/** Already-earned transfers precede planned work; each planned occurrence retains its own state. */
export function buildCourseEnrollments(
    years: PlannerYearData[],
    transfers: { courseName: string; units?: number | null; transferType?: 'AP' | 'Course' }[]
): CourseEnrollment[] {
    const metadata = new Map<string, PlannerCourseData>();
    const roadmap: (CourseEnrollment & { year: number; quarter: number; index: number })[] = [];
    years.forEach((year, yearIndex) =>
        year.quarters.forEach((quarter, quarterIndex) => {
            quarter.courses.forEach((course, courseIndex) => {
                if ('courseName' in course || course.id === 'Loading...') return;
                metadata.set(course.id, course);
                roadmap.push({
                    id: roadmapEnrollmentId(yearIndex, quarterIndex, courseIndex),
                    source: 'roadmap',
                    courseId: course.id,
                    units: course.userChosenUnits ?? course.minUnits,
                    countsForCredit: course.countsForCredit,
                    repeatabilityTimes: course.repeatabilityTimes,
                    repeatabilityType: course.repeatabilityType,
                    year: year.startYear,
                    quarter: quarters.indexOf(quarter.name),
                    index: courseIndex,
                });
            });
        })
    );
    roadmap.sort((a, b) => a.year - b.year || a.quarter - b.quarter || a.index - b.index);

    // AP equivalencies identify satisfied courses, rather than additional takes of an already transferred course.
    const transferredIds = new Set(
        transfers.filter((t) => t.transferType !== 'AP').map((t) => t.courseName.replace(/\s/g, ''))
    );
    const seenAPIds = new Set<string>();
    const transferEnrollments: CourseEnrollment[] = [];
    transfers.forEach((transfer, index) => {
        const courseId = transfer.courseName.replace(/\s/g, '');
        if (transfer.transferType === 'AP') {
            if (transferredIds.has(courseId) || seenAPIds.has(courseId)) return;
            seenAPIds.add(courseId);
        }
        const course = metadata.get(courseId);
        transferEnrollments.push({
            id: `transfer:${index}`,
            source: 'transfer',
            courseId,
            units: transfer.units ?? 0,
            // These records represent credit already earned, including aggregate transfer units.
            countsForCredit: true,
            transferType: transfer.transferType ?? 'Course',
            repeatabilityTimes: course?.repeatabilityTimes,
            repeatabilityType: course?.repeatabilityType,
        });
    });
    return [...transferEnrollments, ...roadmap];
}

/** The occurrence list remains available for later requirement allocation; this is its completion summary. */
export function completedCoursesFromCredits(credits: EnrollmentCredit[]): CompletedCourseSet {
    const completed: CompletedCourseSet = {};
    for (const credit of credits) {
        if (!credit.eligible) continue;
        const previous = completed[credit.courseId];
        completed[credit.courseId] = {
            units: (previous?.units ?? 0) + credit.creditedUnits,
            count: (previous?.count ?? 0) + 1,
            transferType: previous?.transferType ?? credit.transferType,
        };
    }
    return completed;
}

export function totalEnrollmentCredit(credits: EnrollmentCredit[]) {
    return credits.reduce(
        (total, credit) => ({
            unitCount: total.unitCount + credit.creditedUnits,
            courseCount: total.courseCount + Number(credit.eligible),
        }),
        { unitCount: 0, courseCount: 0 }
    );
}

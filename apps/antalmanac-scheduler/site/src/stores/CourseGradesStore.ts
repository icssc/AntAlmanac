import { trpcReact } from '$lib/api/trpc';
import { getCourseId } from '$lib/courseHelpers';
import type { AACourse, SectionCode } from '@packages/antalmanac-types';
import type { GradeDistribution } from '@packages/anteater-api/types';
import type { UseQueryResult } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

type CourseId = string;
type InstructorName = string;

type SectionInstructorGrades = Map<InstructorName, GradeDistribution>;
interface CourseData {
    areOverallGradesLoading: boolean;
    overallGrades: GradeDistribution | null;
    areSectionGradesLoading: boolean;
    sectionGrades: Map<SectionCode, SectionInstructorGrades>;
}
interface CourseGradesStore {
    courseGrades: Map<CourseId, CourseData>;
}

const initialState: CourseGradesStore = {
    courseGrades: new Map(),
};

function getDefaultCourseGrades() {
    return {
        areOverallGradesLoading: true,
        overallGrades: null,
        areSectionGradesLoading: true,
        sectionGrades: new Map(),
    };
}

export const useCourseGradesStore = create(
    combine(initialState, (set, get) => {
        /**
         * Call at the beginning of any function that writes
         */
        const addCourseIfNeeded = (courseId: CourseId) => {
            const courseGrades = get().courseGrades;
            if (!courseGrades.has(courseId)) {
                courseGrades.set(courseId, getDefaultCourseGrades());
            }
            set({ courseGrades });
        };
        return {
            addCourseIfNeeded,
            removeCourse: (courseId: CourseId) => {
                const courseGrades = get().courseGrades;
                courseGrades.delete(courseId);
                set({ courseGrades });
            },
            setOverallGrades: (courseId: CourseId, overallGrades: GradeDistribution | undefined) => {
                addCourseIfNeeded(courseId);
                const courseGrades = get().courseGrades;
                const courseData = get().courseGrades.get(courseId)!;

                if (overallGrades) {
                    courseData.overallGrades = overallGrades;
                }

                // Overall grades are fetched only once, don't need loading-setter function
                courseData.areOverallGradesLoading = false;

                set({ courseGrades });
            },
            setSectionGrades: (
                courseId: CourseId,
                sectionCode: SectionCode,
                instructorGrades: SectionInstructorGrades
            ) => {
                addCourseIfNeeded(courseId);
                const courseGrades = get().courseGrades;
                const courseData = get().courseGrades.get(courseId)!;

                courseData.sectionGrades.set(sectionCode, instructorGrades);

                set({ courseGrades });
            },
            doesSectionHaveGrades: (courseId: CourseId, sectionCode: SectionCode) => {
                const courseGrades = get().courseGrades;
                return Boolean(courseGrades.get(courseId)?.sectionGrades.get(sectionCode));
            },
            setAreSectionGradesLoading: (courseId: CourseId, loading: boolean) => {
                addCourseIfNeeded(courseId);
                const courseGrades = get().courseGrades;
                const courseData = get().courseGrades.get(courseId);
                if (!courseData) {
                    return;
                }

                courseData.areSectionGradesLoading = loading;

                set({ courseGrades });
            },
        };
    })
);

function useFetchOverallGrades(course: AACourse, courseId: CourseId) {
    const setOverallGrades = useCourseGradesStore((state) => state.setOverallGrades);

    const { data: overallGrades, isLoading: areOverallGradesLoading } = trpcReact.grades.aggregateGrades.useQuery(
        { department: course.deptCode, courseNumber: course.courseNumber, instructor: '' },
        { select: (data) => data?.gradeDistribution ?? null }
    );

    const [prevOverallGrades, setPrevOverallGrades] = useState<typeof overallGrades>(overallGrades);
    if (prevOverallGrades !== overallGrades && !areOverallGradesLoading) {
        setPrevOverallGrades(overallGrades);
    }

    useEffect(() => {
        if (!areOverallGradesLoading) {
            setOverallGrades(courseId, overallGrades);
        }
    }, [overallGrades, areOverallGradesLoading, courseId, setOverallGrades]);
}

function useFetchSectionInstructorGrades(course: AACourse, courseId: CourseId) {
    const { setSectionGrades, doesSectionHaveGrades, setAreSectionGradesLoading } = useCourseGradesStore(
        useShallow((state) => ({
            setSectionGrades: state.setSectionGrades,
            doesSectionHaveGrades: state.doesSectionHaveGrades,
            setAreSectionGradesLoading: state.setAreSectionGradesLoading,
        }))
    );

    const [instructorsToIgnore, setInstructorsToIgnore] = useState(new Set<string>());

    const instructorsToFetch = useMemo(() => {
        const instructorSections = new Map<string, string[]>();
        for (const section of course.sections) {
            if (doesSectionHaveGrades(courseId, section.sectionCode)) {
                continue;
            }
            const seenInstructor = section.instructors.find((instructor) => instructorSections.has(instructor));
            if (seenInstructor) {
                instructorSections.get(seenInstructor)!.push(section.sectionCode);
                continue;
            }

            let i = 0;
            while (
                i < section.instructors.length &&
                (section.instructors[i] === 'STAFF' || instructorsToIgnore.has(section.instructors[i]))
            ) {
                i++;
            }

            if (i === section.instructors.length) {
                continue;
            }

            const instructor = section.instructors[i];

            if (!instructorSections.has(instructor)) {
                instructorSections.set(instructor, []);
            }
            instructorSections.get(instructor)!.push(section.sectionCode);
        }
        return instructorSections;
    }, [course.sections, courseId, instructorsToIgnore, doesSectionHaveGrades]);

    const areInstructorGradesValid = useCallback((result: UseQueryResult<{ gradeDistribution: GradeDistribution }>) => {
        return Boolean(
            !result.isError && result.data?.gradeDistribution && result.data.gradeDistribution.averageGPA !== null
        );
    }, []);

    const { sectionInstructorGrades, invalidInstructors, areSectionInstructorGradesLoading } = trpcReact.useQueries(
        (t) =>
            Array.from(instructorsToFetch).map(([instructor]) =>
                t.grades.aggregateGradesForCourse(
                    { department: course.deptCode, courseNumber: course.courseNumber, instructor },
                    { select: (data) => ({ instructor, gradeDistribution: data }) }
                )
            ),
        {
            combine: (results) => {
                const allInstructors = Array.from(instructorsToFetch.keys());
                const sectionInstructorGrades = results.filter(areInstructorGradesValid);
                const validInstructors = new Set(sectionInstructorGrades.map((result) => result.data!.instructor));
                return {
                    sectionInstructorGrades: sectionInstructorGrades,
                    invalidInstructors: allInstructors.filter((instructor) => !validInstructors.has(instructor)),
                    areSectionInstructorGradesLoading: results.some((result) => result.isLoading || result.isFetching),
                };
            },
        }
    );

    const [prevInvalidInstructors, setPrevInvalidInstructors] = useState<typeof invalidInstructors>([]);
    if (invalidInstructors !== prevInvalidInstructors && !areSectionInstructorGradesLoading) {
        const newInstructorsToIgnore = new Set(instructorsToIgnore);

        for (const instructor of invalidInstructors) {
            newInstructorsToIgnore.add(instructor);
        }

        setInstructorsToIgnore(newInstructorsToIgnore);
        setPrevInvalidInstructors(invalidInstructors);
    }

    useEffect(() => {
        for (const result of sectionInstructorGrades) {
            if (!result.data) {
                continue;
            }
            for (const sectionCode of instructorsToFetch.get(result.data.instructor)!) {
                setSectionGrades(
                    courseId,
                    sectionCode,
                    new Map([[result.data.instructor, result.data.gradeDistribution]])
                );
            }
        }
    }, [sectionInstructorGrades, instructorsToFetch, courseId, setSectionGrades, areInstructorGradesValid]);

    useEffect(() => {
        setAreSectionGradesLoading(courseId, areSectionInstructorGradesLoading);
    }, [areSectionInstructorGradesLoading, courseId, setAreSectionGradesLoading]);
}

export function useFetchCourseGrades(course: AACourse) {
    const removeCourse = useCourseGradesStore((state) => state.removeCourse);
    const addCourseIfNeeded = useCourseGradesStore((state) => state.addCourseIfNeeded);

    const courseId = useMemo(() => getCourseId(course), [course]);

    useFetchOverallGrades(course, courseId);
    useFetchSectionInstructorGrades(course, courseId);

    useEffect(() => {
        addCourseIfNeeded(courseId);
        return () => {
            removeCourse(courseId);
        };
    }, [courseId, removeCourse, addCourseIfNeeded]);
}

/**
 * Currently we only support showing grades for one instructor per section
 */
export function getInstructorGradesFromSection(sectionInstructorGrades: SectionInstructorGrades) {
    const [instructor, instructorGrades] = sectionInstructorGrades.entries().next().value!;
    return { instructor, instructorGrades };
}

export function useSectionGrades(courseId: CourseId, sectionCode: SectionCode) {
    const overallGrades = useCourseGradesStore((state) => state.courseGrades.get(courseId)?.overallGrades);
    const areOverallGradesLoading = useCourseGradesStore(
        (state) => state.courseGrades.get(courseId)?.areOverallGradesLoading ?? true
    );

    const sectionInstructorGrades = useCourseGradesStore((state) =>
        state.courseGrades.get(courseId)?.sectionGrades.get(sectionCode)
    );
    const areSectionInstructorGradesLoading = useCourseGradesStore(
        (state) => state.courseGrades.get(courseId)?.areSectionGradesLoading ?? true
    );
    return {
        overallGrades,
        areOverallGradesLoading,
        sectionInstructorGrades,
        areSectionInstructorGradesLoading,
    };
}

import { trpcReact } from '$lib/api/trpc';
import type { AACourse, SectionCode } from '@packages/antalmanac-types';
import type { CourseGradeDistribution } from '@packages/anteater-api/types';
import type { UseQueryResult } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

type InstructorName = string;

type SectionInstructorGrades = Map<InstructorName, CourseGradeDistribution | null>;
interface CourseGrades {
    areOverallGradesLoading: boolean;
    overallGrades: CourseGradeDistribution | null;
    areSectionGradesLoading: boolean;
    sectionGrades: Map<SectionCode, SectionInstructorGrades>;
}
interface CourseGradesStore {
    courseGrades: CourseGrades;
}

function getInitialState(): CourseGradesStore {
    return {
        courseGrades: {
            areOverallGradesLoading: true,
            overallGrades: null,
            areSectionGradesLoading: true,
            sectionGrades: new Map(),
        },
    };
}

export const createCourseGradesStore = () =>
    create(
        combine(getInitialState(), (set, get) => {
            return {
                setOverallGrades: (overallGrades: CourseGradeDistribution | null | undefined) => {
                    const courseGrades = get().courseGrades;

                    if (overallGrades) {
                        courseGrades.overallGrades = overallGrades;
                    }

                    // Overall grades are fetched only once, don't need loading-setter function
                    courseGrades.areOverallGradesLoading = false;

                    set({ courseGrades });
                },
                setSectionGrades: (sectionCode: SectionCode, instructorGrades: SectionInstructorGrades) => {
                    const courseGrades = get().courseGrades;

                    courseGrades.sectionGrades.set(sectionCode, instructorGrades);

                    set({ courseGrades });
                },
                doesSectionHaveGrades: (sectionCode: SectionCode) => {
                    const courseGrades = get().courseGrades;
                    return Boolean(courseGrades.sectionGrades.get(sectionCode));
                },
                setAreSectionGradesLoading: (loading: boolean) => {
                    const courseGrades = get().courseGrades;

                    courseGrades.areSectionGradesLoading = loading;

                    set({ courseGrades });
                },
            };
        })
    );

type UseCourseGradesStore = ReturnType<typeof createCourseGradesStore>;

export const CourseGradesContext = createContext<UseCourseGradesStore | null>(null);

function useUseCourseGradesStore() {
    const useCourseGradesStore = useContext(CourseGradesContext);
    return useCourseGradesStore!;
}

function useFetchOverallGrades(course: AACourse) {
    const useCourseGradesStore = useUseCourseGradesStore();

    const setOverallGrades = useCourseGradesStore((state) => state.setOverallGrades);

    const { data: overallGrades, isLoading: areOverallGradesLoading } =
        trpcReact.grades.aggregateGradesByCourse.useQuery({
            department: course.deptCode,
            courseNumber: course.courseNumber,
            instructor: '',
        });

    const [prevOverallGrades, setPrevOverallGrades] = useState<typeof overallGrades>(overallGrades);
    if (prevOverallGrades !== overallGrades && !areOverallGradesLoading) {
        setPrevOverallGrades(overallGrades);
    }

    useEffect(() => {
        if (!areOverallGradesLoading) {
            setOverallGrades(overallGrades);
        }
    }, [overallGrades, areOverallGradesLoading, setOverallGrades]);
}

function useFetchSectionInstructorGrades(course: AACourse) {
    const useCourseGradesStore = useUseCourseGradesStore();

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
            if (doesSectionHaveGrades(section.sectionCode)) {
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
    }, [course.sections, instructorsToIgnore, doesSectionHaveGrades]);

    const areInstructorGradesValid = useCallback(
        (result: UseQueryResult<{ gradeDistribution: CourseGradeDistribution | null }>) => {
            return Boolean(
                !result.isError && result.data?.gradeDistribution && result.data.gradeDistribution.averageGPA !== null
            );
        },
        []
    );

    const { sectionInstructorGrades, invalidInstructors, areSectionInstructorGradesLoading } = trpcReact.useQueries(
        (t) =>
            Array.from(instructorsToFetch).map(([instructor]) =>
                t.grades.aggregateGradesByCourse(
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
                setSectionGrades(sectionCode, new Map([[result.data.instructor, result.data.gradeDistribution]]));
            }
        }
    }, [sectionInstructorGrades, instructorsToFetch, setSectionGrades, areInstructorGradesValid]);

    useEffect(() => {
        setAreSectionGradesLoading(areSectionInstructorGradesLoading);
    }, [areSectionInstructorGradesLoading, setAreSectionGradesLoading]);
}

export function useFetchCourseGrades(course: AACourse) {
    useFetchOverallGrades(course);
    useFetchSectionInstructorGrades(course);
}

/**
 * Currently we only support showing grades for one instructor per section
 */
export function getInstructorGradesFromSection(sectionInstructorGrades: SectionInstructorGrades) {
    const [instructor, instructorGrades] = sectionInstructorGrades.entries().next().value!;
    return { instructor, instructorGrades };
}

/**
 * Use under a component that renders `CourseGradesStoreProvider`
 */
export function useSectionGrades(sectionCode: SectionCode) {
    const useCourseGradesStore = useUseCourseGradesStore();

    const overallGrades = useCourseGradesStore((state) => state.courseGrades.overallGrades);
    const areOverallGradesLoading = useCourseGradesStore((state) => state.courseGrades.areOverallGradesLoading);

    const sectionInstructorGrades = useCourseGradesStore((state) => state.courseGrades.sectionGrades.get(sectionCode));
    const areSectionInstructorGradesLoading = useCourseGradesStore(
        (state) => state.courseGrades.areSectionGradesLoading
    );
    return {
        overallGrades,
        areOverallGradesLoading,
        sectionInstructorGrades,
        areSectionInstructorGradesLoading,
    };
}

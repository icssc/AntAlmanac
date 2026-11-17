import { trpc } from '$lib/api/trpc';
import { getCourseId } from '$lib/courseHelpers';
import { openSnackbar } from '$stores/SnackbarStore';
import type { AACourse, SectionCode } from '@packages/antalmanac-types';
import type { GradeDistribution } from '@packages/anteater-api/types';
import { useEffect } from 'react';
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
    courses: Map<CourseId, CourseData>;
}

const initialState: CourseGradesStore = {
    courses: new Map(),
};

export const useCourseGradesStore = create(
    combine(initialState, (set, get) => {
        const addCourse = (courseId: CourseId) => {
            const courses = get().courses;
            courses.set(courseId, {
                areOverallGradesLoading: true,
                overallGrades: null,
                areSectionGradesLoading: true,
                sectionGrades: new Map(),
            });
            set({ courses });
        };

        const setOverallGrades = (courseId: CourseId, overallGrades: GradeDistribution) => {
            const courses = get().courses;

            const courseData = get().courses.get(courseId)!;
            courseData.overallGrades = overallGrades;
            courseData.areOverallGradesLoading = false;

            set({ courses });
        };
        const setSectionGrades = (
            courseId: CourseId,
            sectionCode: SectionCode,
            instructorGrades: SectionInstructorGrades
        ) => {
            const courses = get().courses;

            const courseData = get().courses.get(courseId)!;
            courseData.sectionGrades.set(sectionCode, instructorGrades);
            courseData.areSectionGradesLoading = false;

            set({ courses });
        };

        const fetchOverallGrades = async (course: AACourse, abortController: AbortController) => {
            const courseId = getCourseId(course);

            try {
                const { gradeDistribution: overallGrades } = await trpc.grades.aggregateGrades.query(
                    { department: course.deptCode, courseNumber: course.courseNumber, instructor: '' },
                    { signal: abortController.signal }
                );

                // Calling component may have unmounted
                if (!get().courses.has(courseId)) {
                    return;
                }

                setOverallGrades(courseId, overallGrades);
            } catch (error) {
                if (abortController.signal.aborted) {
                    return;
                }
                openSnackbar('error', `Failed to fetch overall grades for ${courseId}`);
                console.error(error);
            }
        };

        const fetchSectionGrades = async (course: AACourse, abortController: AbortController) => {
            const courseId = getCourseId(course);

            const instructorGradesMap: SectionInstructorGrades = new Map();

            for (const section of course.sections) {
                const instructorWithGrades = section.instructors.find((instructor) =>
                    instructorGradesMap.has(instructor)
                );
                if (instructorWithGrades) {
                    setSectionGrades(
                        courseId,
                        section.sectionCode,
                        new Map([[instructorWithGrades, instructorGradesMap.get(instructorWithGrades)!]])
                    );
                    continue;
                }

                for (const instructor of section.instructors) {
                    if (instructor === 'STAFF') {
                        continue;
                    }

                    try {
                        const { gradeDistribution: instructorGrades } = await trpc.grades.aggregateGrades.query(
                            {
                                department: course.deptCode,
                                courseNumber: course.courseNumber,
                                instructor,
                            },
                            { signal: abortController.signal }
                        );

                        // Calling component may have unmounted
                        if (!get().courses.has(courseId)) {
                            return;
                        }

                        setSectionGrades(courseId, section.sectionCode, new Map([[instructor, instructorGrades]]));

                        instructorGradesMap.set(instructor, instructorGrades);
                    } catch (error) {
                        if (abortController.signal.aborted) {
                            return;
                        }
                        openSnackbar(
                            'error',
                            `Failed to fetch instructor grades for ${instructor} teaching ${courseId}`
                        );
                        console.error(error);
                    }
                }
            }
        };

        return {
            removeCourse: (courseId: CourseId) => {
                const courses = get().courses;
                courses.delete(courseId);
                set({ courses });
            },
            fetchCourseGrades: (course: AACourse, abortController: AbortController) => {
                addCourse(getCourseId(course));

                fetchOverallGrades(course, abortController);

                fetchSectionGrades(course, abortController);
            },
        };
    })
);

export function useFetchCourseGrades(course: AACourse) {
    const { fetchCourseGrades, removeCourse } = useCourseGradesStore(
        useShallow((state) => ({
            fetchCourseGrades: state.fetchCourseGrades,
            removeCourse: state.removeCourse,
        }))
    );

    useEffect(() => {
        const abortController = new AbortController();

        fetchCourseGrades(course, abortController);

        return () => {
            removeCourse(getCourseId(course));
            abortController.abort();
        };
    }, [fetchCourseGrades, removeCourse, course]);
}

/**
 * Currently we only support showing grades for one instructor per section
 */
export function getInstructorGradesFromSection(sectionInstructorGrades: SectionInstructorGrades) {
    const [instructor, instructorGrades] = Array.from(sectionInstructorGrades.entries())[0];
    return { instructor, instructorGrades };
}

export function useSectionGrades(courseId: CourseId, sectionCode: SectionCode) {
    const overallGrades = useCourseGradesStore((state) => state.courses.get(courseId)?.overallGrades);
    const areOverallGradesLoading = useCourseGradesStore(
        (state) => state.courses.get(courseId)?.areOverallGradesLoading
    );

    const sectionInstructorGrades = useCourseGradesStore((state) =>
        state.courses.get(courseId)?.sectionGrades.get(sectionCode)
    );
    const areSectionInstructorGradesLoading = useCourseGradesStore(
        (state) => state.courses.get(courseId)?.areSectionGradesLoading
    );
    return {
        overallGrades,
        areOverallGradesLoading,
        sectionInstructorGrades,
        areSectionInstructorGradesLoading,
    };
}

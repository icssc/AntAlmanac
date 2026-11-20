import { CourseGradeFetcher } from '$components/RightPane/SectionTable/CourseGradeFetcher';
import { useStoreInstance } from '$hooks/useStoreInstance';
import { CourseGradesContext, createCourseGradesStore } from '$stores/CourseGradesStore';
import type { AACourse } from '@packages/antalmanac-types';
import type { ReactNode } from 'react';

interface CourseGradesStoreProviderProps {
    children: ReactNode;
    course: AACourse;
}

export function CourseGradesStoreProvider({ children, course }: CourseGradesStoreProviderProps) {
    const useCourseGradesStore = useStoreInstance(createCourseGradesStore);

    return (
        <CourseGradesContext.Provider value={useCourseGradesStore}>
            <CourseGradeFetcher course={course} /> {children}
        </CourseGradesContext.Provider>
    );
}

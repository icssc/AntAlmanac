import {
    defaultCourseSearchFormValues,
    serializeCourseSearchParams,
} from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { AATerm } from '$lib/term';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useQuickSearch() {
    const displaySections = useCoursePaneStore((s) => s.displaySections);
    const forceUpdate = useCoursePaneStore((s) => s.forceUpdate);
    const setActiveTab = useTabStore((s) => s.setActiveTab);
    const navigate = useNavigate();

    return useCallback(
        (deptValue: string, courseNumber: string, term: AATerm) => {
            const href = serializeCourseSearchParams('/', {
                ...defaultCourseSearchFormValues,
                term,
                deptValue: deptValue,
                courseNumber: courseNumber,
            });

            navigate(href, { replace: false });
            setActiveTab('search');
            displaySections();
            forceUpdate();
        },
        [displaySections, forceUpdate, navigate, setActiveTab]
    );
}

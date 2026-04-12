import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getDefaultFormValues, serializeSearchParams } from '$lib/searchParams';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';

export function useQuickSearch() {
    const { displaySections, forceUpdate } = useCoursePaneStore();
    const { setActiveTab } = useTabStore();
    const navigate = useNavigate();

    return useCallback(
        (deptValue: string, courseNumber: string, termValue: string) => {
            const params = {
                ...getDefaultFormValues(),
                term: termValue,
                deptValue: deptValue,
                courseNumber: courseNumber,
            };

            const href = `/${serializeSearchParams(params)}`;

            navigate(href, { replace: false });
            setActiveTab('search');
            displaySections();
            forceUpdate();
        },
        [displaySections, forceUpdate, navigate, setActiveTab]
    );
}

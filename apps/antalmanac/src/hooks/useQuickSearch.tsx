import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';

export function useQuickSearch() {
    const { displaySections, forceUpdate } = useCoursePaneStore();
    const { setActiveTab } = useTabStore();
    const navigate = useNavigate();

    return useCallback(
        (deptValue: string, courseNumber: string, termValue: string) => {
            const queryParams = {
                term: termValue,
                deptValue: deptValue,
                courseNumber: courseNumber,
            };
            const href = `/?${Object.entries(queryParams)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&')}`;

            RightPaneStore.resetFormValues();
            RightPaneStore.updateFormValue('deptValue', deptValue);
            RightPaneStore.updateFormValue('courseNumber', courseNumber);
            RightPaneStore.updateFormValue('term', termValue);
            navigate(href, { replace: false });
            setActiveTab('search');
            displaySections();
            forceUpdate();
        },
        [displaySections, forceUpdate, navigate, setActiveTab]
    );
}

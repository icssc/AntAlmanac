import RightPaneStore from '$components/RightPane/RightPaneStore';
import { AATerm, getTermByShortName } from '$lib/term';
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
        (deptValue: string, courseNumber: string, termValue: AATerm['shortName']) => {
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
            const term = getTermByShortName(termValue);
            if (term) RightPaneStore.setTerm(term);
            navigate(href, { replace: false });
            setActiveTab('search');
            displaySections();
            forceUpdate();
        },
        [displaySections, forceUpdate, navigate, setActiveTab]
    );
}

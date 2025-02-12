import { MouseEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { openSnackbar } from '$actions/AppStoreActions';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';

export const warnMultipleTerms = (terms: Set<string>) => {
    openSnackbar(
        'warning',
        `Course added from different term.\nSchedule now contains courses from ${[...terms].sort().join(', ')}.`,
        undefined,
        undefined,
        { whiteSpace: 'pre-line' }
    );
};

export async function clickToCopy(event: MouseEvent<HTMLElement>, sectionCode: string) {
    event.stopPropagation();
    await navigator.clipboard.writeText(sectionCode);
    openSnackbar('success', 'WebsocSection code copied to clipboard');
}

export function useQuickSearchForClasses() {
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

            RightPaneStore.updateFormValue('deptValue', deptValue);
            RightPaneStore.updateFormValue('courseNumber', courseNumber);
            RightPaneStore.updateFormValue('term', termValue);
            navigate(href, { replace: false });
            setActiveTab('search');
            displaySections();
            forceUpdate();
        },
        [displaySections, forceUpdate, setActiveTab]
    );
}

export const FAKE_LOCATIONS = ['VRTL REMOTE', 'ON LINE', 'TBA'];

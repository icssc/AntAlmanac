import { MouseEvent, useCallback } from 'react';

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

    return useCallback(
        (title: string, termValue: string) => {
            // separates the course title between it's course number and department label
            const decomposeCourseInfo: string[] | undefined = title.match(/^(.*)\s(\S+)$/)?.slice(1);

            if (decomposeCourseInfo) {
                const [department, courseNumber] = decomposeCourseInfo;
                RightPaneStore.updateFormValue('deptValue', department);
                RightPaneStore.updateFormValue('courseNumber', courseNumber);
                RightPaneStore.updateFormValue('term', termValue);
                // forceUpdate();
                displaySections();
                setActiveTab(1);
            }
        },
        [displaySections, forceUpdate, setActiveTab]
    ); // Added dependencies used inside callback
}

export const FAKE_LOCATIONS = ['VRTL REMOTE', 'ON LINE', 'TBA'];

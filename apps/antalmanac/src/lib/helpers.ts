import { MouseEvent } from 'react';

import { openSnackbar } from '$actions/AppStoreActions';
import depts from '$components/RightPane/CoursePane/SearchForm/DeptSearchBar/depts';
import { useQuickSearchStore } from '$stores/QuickSearchStore';
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

export function quickSearchForClasses(title: string, term: string) {
    const decompCourseInfo: string[] | undefined = title.match(/^(.*)\s(\S+)$/)?.slice(1);
    const tabNum = useTabStore.getState().activeTab;

    // tabNum == 1 locks this feature to only the Search page (even on mobile)
    if (decompCourseInfo && tabNum == 1) {
        const deptIdx: number = depts.findIndex((item) => item.deptValue === decompCourseInfo[0]);
        useQuickSearchStore.getState().setValue({
            term: term,
            deptLabel: depts[deptIdx].deptLabel,
            deptValue: decompCourseInfo[0],
            courseNumber: decompCourseInfo[1],
        });
    }
}

export const FAKE_LOCATIONS = ['VRTL REMOTE', 'ON LINE', 'TBA'];

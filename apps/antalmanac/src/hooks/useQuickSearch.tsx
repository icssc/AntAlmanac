import RightPaneStore from '$components/RightPane/RightPaneStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { useTabStore } from '$stores/TabStore';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useQuickSearch() {
    const displaySections = useCoursePaneStore((s) => s.displaySections);
    const forceUpdate = useCoursePaneStore((s) => s.forceUpdate);
    const setActiveTab = useTabStore((s) => s.setActiveTab);
    const router = useRouter();

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
            router.push(href);
            setActiveTab('search');
            displaySections();
            forceUpdate();
        },
        [displaySections, forceUpdate, router, setActiveTab]
    );
}

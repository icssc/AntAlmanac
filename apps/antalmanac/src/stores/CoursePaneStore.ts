import { create } from 'zustand';

import RightPaneStore from '$components/RightPane/RightPaneStore';
interface CoursePaneStore {
    /** Whether the search form is displayed (or the classes view) */
    searchFormIsDisplayed: boolean;
    /** Switch to the course search form */
    displaySearch: () => void;
    /** Switch to the classes view */
    displaySections: () => void;

    manualSearchEnabled: boolean;
    enableManualSearch: () => void;
    disableManualSearch: () => void;
    toggleManualSearch: () => void;

    key: number;
    forceUpdate: () => void;
}

export function paramsAreInURL() {
    const search = new URLSearchParams(window.location.search);

    // TODO: This should be standardized
    const searchParams = [
        'courseCode',
        'courseNumber',
        'ge',
        'deptValue',
        'term',
        'sectionCode',
        'instructor',
        'units',
        'endTime',
        'startTime',
        'coursesFull',
        'building',
        'room',
        'division',
    ];

    return searchParams.some((param) => search.get(param) !== null);
}

function requiredParamsAreInURL() {
    const search = new URLSearchParams(window.location.search);

    const searchParams = ['courseCode', 'courseNumber', 'ge', 'deptValue'];

    return searchParams.some((param) => search.get(param) !== null);
}

export const useCoursePaneStore = create<CoursePaneStore>((set) => {
    return {
        searchFormIsDisplayed: !requiredParamsAreInURL() || !RightPaneStore.formDataIsValid(),
        displaySearch: () => {
            set({ searchFormIsDisplayed: true });
        },
        displaySections: () => {
            set({ searchFormIsDisplayed: false });
        },

        manualSearchEnabled: paramsAreInURL(),
        enableManualSearch: () => set({ manualSearchEnabled: true }),
        disableManualSearch: () => set({ manualSearchEnabled: false }),
        toggleManualSearch: () => set((state) => ({ manualSearchEnabled: !state.manualSearchEnabled })),

        key: 0,
        forceUpdate: () => set((state) => ({ key: (state.key += 1) })),
    };
});

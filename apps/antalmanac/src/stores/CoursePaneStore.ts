import { create } from 'zustand';

import { ADVANCED_SEARCH_PARAMS, MANUAL_SEARCH_PARAMS } from '$components/RightPane/CoursePane/SearchForm/constants';
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

    advancedSearchEnabled: boolean;
    enableAdvancedSearch: () => void;
    disableAdvancedSearch: () => void;
    toggleAdvancedSearch: () => void;

    key: number;
    forceUpdate: () => void;
}

export function paramsAreInURL() {
    const search = new URLSearchParams(window.location.search);
    return MANUAL_SEARCH_PARAMS.some((param) => search.get(param) !== null);
}

function advancedParamsAreInURL() {
    const search = new URLSearchParams(window.location.search);
    return ADVANCED_SEARCH_PARAMS.some((param) => search.get(param) !== null);
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

        advancedSearchEnabled: advancedParamsAreInURL(),
        enableAdvancedSearch: () => set({ advancedSearchEnabled: true }),
        disableAdvancedSearch: () => set({ advancedSearchEnabled: false }),
        toggleAdvancedSearch: () => set((state) => ({ advancedSearchEnabled: !state.advancedSearchEnabled })),

        key: 0,
        forceUpdate: () => set((state) => ({ key: (state.key += 1) })),
    };
});

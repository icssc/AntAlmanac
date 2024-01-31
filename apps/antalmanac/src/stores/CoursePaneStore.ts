import { create } from 'zustand';

interface CoursePaneStore {
    /** Whether the search form is displayed (or the classes view) */
    searchIsDisplayed: boolean;
    /** Switch to the course search form */
    displaySearch: () => void;
    /** Switch to the classes view */
    displaySections: () => void;

    manualSearchEnabled: boolean;
    enableManualSearch: () => void;
    disableManualSearch: () => void;
    toggleManualSearch: () => void;
}

function paramsAreInURL() {
    const search = new URLSearchParams(window.location.search);

    // TODO: This should be standardized
    const searchParams = ['courseCode', 'courseNumber', 'deptLabel', 'GE', 'deptValue', 'term'];

    return searchParams.some((param) => search.get(param) !== null);
}

export const useCoursePaneStore = create<CoursePaneStore>((set) => {
    return {
        searchIsDisplayed: true,
        displaySearch: () => {
            console.log('switching to search');
            set({ searchIsDisplayed: true });
        },
        displaySections: () => {
            console.log('Switching to sections');
            set({ searchIsDisplayed: false });
        },

        manualSearchEnabled: paramsAreInURL(),
        enableManualSearch: () => set({ manualSearchEnabled: true }),
        disableManualSearch: () => set({ manualSearchEnabled: false }),
        toggleManualSearch: () => set((state) => ({ manualSearchEnabled: !state.manualSearchEnabled })),
    };
});

export default useCoursePaneStore;

import { create } from 'zustand';

interface CoursePaneStore {
    /** Whether the search form is displayed (or the classes view) */
    searchFormIsDisplayed: boolean;
    /** Switch to the course search form */
    displaySearch: () => void;
    /** Switch to the classes view */
    displaySections: () => void;
    initializeSearchUi: (
        searchUiState: Pick<CoursePaneStore, 'searchFormIsDisplayed' | 'manualSearchEnabled' | 'advancedSearchEnabled'>
    ) => void;

    manualSearchEnabled: boolean;
    enableManualSearch: () => void;
    disableManualSearch: () => void;
    toggleManualSearch: () => void;

    advancedSearchEnabled: boolean;
    enableAdvancedSearch: () => void;
    disableAdvancedSearch: () => void;
    toggleAdvancedSearch: () => void;

    hasSearchedWithUrlParams: boolean;
    setHasSearchedWithUrlParams: (hasSearchedWithUrlParams: boolean) => void;

    key: number;
    forceUpdate: () => void;
}

export const useCoursePaneStore = create<CoursePaneStore>((set) => {
    return {
        searchFormIsDisplayed: true,
        initializeSearchUi: (searchUiState) => set(searchUiState),

        manualSearchEnabled: false,
        enableManualSearch: () => set({ manualSearchEnabled: true }),
        disableManualSearch: () => set({ manualSearchEnabled: false }),
        toggleManualSearch: () => set((state) => ({ manualSearchEnabled: !state.manualSearchEnabled })),

        advancedSearchEnabled: false,
        enableAdvancedSearch: () => set({ advancedSearchEnabled: true }),
        disableAdvancedSearch: () => set({ advancedSearchEnabled: false }),
        toggleAdvancedSearch: () => set((state) => ({ advancedSearchEnabled: !state.advancedSearchEnabled })),

        hasSearchedWithUrlParams: false,
        setHasSearchedWithUrlParams: (hasSearchedWithUrlParams: boolean) => set({ hasSearchedWithUrlParams }),

        displaySearch: () => {
            set({ searchFormIsDisplayed: true });
        },
        displaySections: () => {
            set({ searchFormIsDisplayed: false });
        },

        key: 0,
        forceUpdate: () => set((state) => ({ key: (state.key += 1) })),
    };
});

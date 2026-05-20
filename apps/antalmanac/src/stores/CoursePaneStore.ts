import { create } from 'zustand';

interface CoursePaneStoreState {
    searchFormIsDisplayed: boolean;
    advancedSearchEnabled: boolean;
    initialized: boolean;
    initialize: (searchFormIsDisplayed: boolean, advancedSearchEnabled: boolean) => void;
    setSearchFormIsDisplayed: (value: boolean) => void;
    setAdvancedSearchEnabled: (value: boolean) => void;
}

export const useCoursePaneStore = create<CoursePaneStoreState>((set) => ({
    searchFormIsDisplayed: true,
    advancedSearchEnabled: false,
    initialized: false,

    initialize: (searchFormIsDisplayed, advancedSearchEnabled) =>
        set({ searchFormIsDisplayed, advancedSearchEnabled, initialized: true }),

    setSearchFormIsDisplayed: (searchFormIsDisplayed) => set({ searchFormIsDisplayed }),
    setAdvancedSearchEnabled: (advancedSearchEnabled) => set({ advancedSearchEnabled }),
}));

import { create } from 'zustand';

interface CoursePaneStoreState {
    searchFormIsDisplayed: boolean;
    advancedSearchEnabled: boolean;
    initialized: boolean;

    initialize: (searchFormIsDisplayed: boolean, advancedSearchEnabled: boolean) => void;
    setSearchFormIsDisplayed: (value: boolean) => void;
    setAdvancedSearchEnabled: (value: boolean) => void;

    /** Saved query string from the last time the user left the Search tab. */
    savedSearch: string | null;

    /** Snapshot location.search into the store (callable outside React). */
    saveSearch: () => void;
    /** Return and clear the saved search string. */
    popSavedSearch: () => string | null;
}

export const useCoursePaneStore = create<CoursePaneStoreState>((set, get) => ({
    searchFormIsDisplayed: true,
    advancedSearchEnabled: false,
    initialized: false,
    savedSearch: null,

    initialize: (searchFormIsDisplayed, advancedSearchEnabled) =>
        set({ searchFormIsDisplayed, advancedSearchEnabled, initialized: true }),

    setSearchFormIsDisplayed: (searchFormIsDisplayed) => set({ searchFormIsDisplayed }),
    setAdvancedSearchEnabled: (advancedSearchEnabled) => set({ advancedSearchEnabled }),

    saveSearch: () => set({ savedSearch: location.search }),

    popSavedSearch: () => {
        const { savedSearch } = get();
        set({ savedSearch: null });
        return savedSearch;
    },
}));

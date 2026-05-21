import { create } from 'zustand';

interface CoursePaneStoreState {
    advancedSearchEnabled: boolean;
    /** Saved query string from the last time the user left the Search tab. */
    savedSearch: string | null;
    setAdvancedSearchEnabled: (value: boolean) => void;
    /** Snapshot location.search into the store (callable outside React). */
    saveSearch: () => void;
    /** Return and clear the saved search string. */
    popSavedSearch: () => string | null;
}

export const useCoursePaneStore = create<CoursePaneStoreState>((set, get) => ({
    advancedSearchEnabled: false,
    savedSearch: null,

    setAdvancedSearchEnabled: (advancedSearchEnabled) => set({ advancedSearchEnabled }),

    saveSearch: () => set({ savedSearch: location.search }),

    popSavedSearch: () => {
        const { savedSearch } = get();
        set({ savedSearch: null });
        return savedSearch;
    },
}));

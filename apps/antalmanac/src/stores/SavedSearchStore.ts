import { create } from 'zustand';

/** Ephemeral UI only — search params live in the URL via useCourseSearchUrlState. */
interface SavedSearchStoreState {
    /**
     * Tab routes replace the URL when leaving Search; we stash location.search here
     * on exit and replay it when the user returns.
     */
    savedSearch: string | null;
    saveSearch: () => void;
    popSavedSearch: () => string | null;
}

export const useSavedSearchStore = create<SavedSearchStoreState>((set, get) => ({
    savedSearch: null,

    saveSearch: () => set({ savedSearch: location.search }),

    popSavedSearch: () => {
        const { savedSearch } = get();
        set({ savedSearch: null });
        return savedSearch;
    },
}));

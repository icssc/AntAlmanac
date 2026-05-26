import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { create } from 'zustand';

/** Ephemeral UI only — search params live in the URL via nuqs hooks in searchParams.ts. */
interface SavedSearchStoreState {
    /**
     * Tab routes replace the URL when leaving Search; we stash location.search here
     * on exit and replay it when the user returns.
     */
    savedSearch: string | null;
    saveSearch: () => void;
    popSavedSearch: () => string | null;

    /** Manual search draft preserved when switching to quick search. */
    savedManualSearch: CourseSearchParams | null;
    saveManualSearch: (params: CourseSearchParams) => void;
    clearManualSearch: () => void;
}

export const useSavedSearchStore = create<SavedSearchStoreState>((set, get) => ({
    savedSearch: null,
    saveSearch: () => set({ savedSearch: location.search }),
    popSavedSearch: () => {
        const { savedSearch } = get();
        set({ savedSearch: null });
        return savedSearch;
    },

    savedManualSearch: null,
    saveManualSearch: (params) => set({ savedManualSearch: { ...params, term: params.term } }),
    clearManualSearch: () => set({ savedManualSearch: null }),
}));

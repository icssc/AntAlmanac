import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import { create } from 'zustand';

/** Ephemeral UI only — search params live in the URL via nuqs hooks in SearchParams/. */
interface SavedSearchStoreState {
    /**
     * Tab routes replace the URL when leaving Search; we stash the query string here
     * on exit and replay it when the user returns.
     */
    savedSearch: string | null;
    saveSearch: (search: string) => void;
    popSavedSearch: () => string | null;

    /** Manual search draft preserved when switching to quick search. */
    savedManualSearch: CourseSearchParams | null;
    saveManualSearch: (params: CourseSearchParams) => void;
    clearManualSearch: () => void;
}

export const useSavedSearchStore = create<SavedSearchStoreState>((set, get) => ({
    savedSearch: null,
    saveSearch: (search) => set({ savedSearch: search || null }),
    popSavedSearch: () => {
        const { savedSearch } = get();
        set({ savedSearch: null });
        return savedSearch;
    },

    savedManualSearch: null,
    saveManualSearch: (params) => set({ savedManualSearch: params }),
    clearManualSearch: () => set({ savedManualSearch: null }),
}));

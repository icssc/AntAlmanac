import { MANUAL_SEARCH_PARAMS } from '$components/RightPane/CoursePane/SearchForm/constants';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { shouldSearchPlannerFromParams } from '$lib/plannerHelpers';
import { create } from 'zustand';

export enum CoursePaneWarningType {
    TermUnavailable = 'termUnavailable',
}

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

    hasSearchedWithUrlParams: boolean;
    setHasSearchedWithUrlParams: (hasSearchedWithUrlParams: boolean) => void;

    warningMessages: Record<CoursePaneWarningType, string[]>;
    setWarningMessages: (warningType: CoursePaneWarningType, warningMessages: string[]) => void;
    removeWarningMessage: (warningType: CoursePaneWarningType, messageToRemove: string) => void;
    clearWarningMessages: (warningType: CoursePaneWarningType) => void;

    key: number;
    forceUpdate: () => void;
}

export function paramsAreInURL() {
    const search = new URLSearchParams(window.location.search);
    return MANUAL_SEARCH_PARAMS.some((param) => search.get(param) !== null);
}

function requiredParamsAreInURL() {
    const search = new URLSearchParams(window.location.search);

    const searchParams = ['sectionCode', 'courseNumber', 'ge', 'deptValue'];

    return searchParams.some((param) => search.get(param) !== null);
}

export const useCoursePaneStore = create<CoursePaneStore>((set, get) => {
    return {
        searchFormIsDisplayed: !requiredParamsAreInURL() || !RightPaneStore.formDataIsValid(),

        manualSearchEnabled: paramsAreInURL() && !shouldSearchPlannerFromParams(),
        enableManualSearch: () => set({ manualSearchEnabled: true }),
        disableManualSearch: () => set({ manualSearchEnabled: false }),
        toggleManualSearch: () => set((state) => ({ manualSearchEnabled: !state.manualSearchEnabled })),

        advancedSearchEnabled: RightPaneStore.formDataHasAdvancedSearch(),
        enableAdvancedSearch: () => set({ advancedSearchEnabled: true }),
        disableAdvancedSearch: () => set({ advancedSearchEnabled: false }),
        toggleAdvancedSearch: () => set((state) => ({ advancedSearchEnabled: !state.advancedSearchEnabled })),

        hasSearchedWithUrlParams: false,
        setHasSearchedWithUrlParams: (hasSearchedWithUrlParams: boolean) => set({ hasSearchedWithUrlParams }),

        displaySearch: () => {
            RightPaneStore.restorePrevFormData();
            set({ searchFormIsDisplayed: true });
            set({ advancedSearchEnabled: RightPaneStore.formDataHasAdvancedSearch() });
        },
        displaySections: () => {
            set({ searchFormIsDisplayed: false });
        },

        warningMessages: { [CoursePaneWarningType.TermUnavailable]: [] },
        setWarningMessages: (warningType, messages) => {
            set({ warningMessages: { ...get().warningMessages, [warningType]: messages } });
        },
        removeWarningMessage: (warningType, messageToRemove) => {
            const currentState = get();
            const messages = currentState.warningMessages[warningType];
            messages.splice(messages.indexOf(messageToRemove), 1);
            set({ warningMessages: { ...get().warningMessages, [warningType]: messages } });
        },
        clearWarningMessages: (warningType) =>
            set({ warningMessages: { ...get().warningMessages, [warningType]: [] } }),

        key: 0,
        forceUpdate: () => set((state) => ({ key: (state.key += 1) })),
    };
});

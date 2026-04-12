import { create } from 'zustand';

import { BASIC_SEARCH_KEYS, ADVANCED_SEARCH_KEYS, formDataHasAdvancedSearch, formDataIsValid } from '$lib/searchParams';

interface CoursePaneStore {
    searchFormIsDisplayed: boolean;
    displaySearch: () => void;
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
    const allKeys = [...BASIC_SEARCH_KEYS, ...ADVANCED_SEARCH_KEYS, 'term'] as const;
    return allKeys.some((param) => search.get(param) !== null);
}

function requiredParamsAreInURL() {
    const search = new URLSearchParams(window.location.search);
    return BASIC_SEARCH_KEYS.some((param) => search.get(param) !== null);
}

function getInitialFormData() {
    const search = new URLSearchParams(window.location.search);
    const data: Record<string, string> = {};
    for (const [key, value] of search.entries()) {
        data[key] = value;
    }
    return data;
}

export const useCoursePaneStore = create<CoursePaneStore>((set) => {
    const initialFormData = getInitialFormData();

    return {
        searchFormIsDisplayed:
            !requiredParamsAreInURL() ||
            !formDataIsValid({
                ge: initialFormData.ge ?? 'ANY',
                deptValue: initialFormData.deptValue ?? 'ALL',
                sectionCode: initialFormData.sectionCode ?? '',
                instructor: initialFormData.instructor ?? '',
                term: initialFormData.term ?? '',
                courseNumber: initialFormData.courseNumber ?? '',
                coursesFull: initialFormData.coursesFull ?? 'ANY',
                building: initialFormData.building ?? '',
                room: initialFormData.room ?? '',
                division: initialFormData.division ?? '',
                units: initialFormData.units ?? '',
                endTime: initialFormData.endTime ?? '',
                startTime: initialFormData.startTime ?? '',
                excludeRoadmapCourses: initialFormData.excludeRoadmapCourses ?? '',
                excludeRestrictionCodes: initialFormData.excludeRestrictionCodes ?? '',
                days: initialFormData.days ?? '',
            }),

        manualSearchEnabled: paramsAreInURL(),
        enableManualSearch: () => set({ manualSearchEnabled: true }),
        disableManualSearch: () => set({ manualSearchEnabled: false }),
        toggleManualSearch: () => set((state) => ({ manualSearchEnabled: !state.manualSearchEnabled })),

        advancedSearchEnabled: formDataHasAdvancedSearch({
            instructor: initialFormData.instructor ?? '',
            units: initialFormData.units ?? '',
            endTime: initialFormData.endTime ?? '',
            startTime: initialFormData.startTime ?? '',
            coursesFull: initialFormData.coursesFull ?? 'ANY',
            building: initialFormData.building ?? '',
            room: initialFormData.room ?? '',
            division: initialFormData.division ?? '',
            excludeRoadmapCourses: initialFormData.excludeRoadmapCourses ?? '',
            excludeRestrictionCodes: initialFormData.excludeRestrictionCodes ?? '',
            days: initialFormData.days ?? '',
            ge: initialFormData.ge ?? 'ANY',
            deptValue: initialFormData.deptValue ?? 'ALL',
            term: initialFormData.term ?? '',
            courseNumber: initialFormData.courseNumber ?? '',
            sectionCode: initialFormData.sectionCode ?? '',
        }),
        enableAdvancedSearch: () => set({ advancedSearchEnabled: true }),
        disableAdvancedSearch: () => set({ advancedSearchEnabled: false }),
        toggleAdvancedSearch: () => set((state) => ({ advancedSearchEnabled: !state.advancedSearchEnabled })),

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

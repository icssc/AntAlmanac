import { create } from 'zustand';

import analyticsEnum, { logAnalytics } from '$lib/analytics';

/**
 * Search results are displayed in a tabular format.
 *
 * Users can toggle certain columns on/off.
 */
export const SECTION_TABLE_COLUMNS = [
    'action',
    'sectionCode',
    'sectionDetails',
    'instructors',
    'gpa',
    'dayAndTime',
    'location',
    'sectionEnrollment',
    'restrictions',
    'status',
] as const;

export type SectionTableColumn = (typeof SECTION_TABLE_COLUMNS)[number];

interface ColumnStore {
    // Columns that are selected in the dropdown
    selectedColumns: boolean[];

    // Columns that should be displayed in the section table. They need to be both selected and enabled.
    // This is updated whenever enabledColumns or selectedColumns are updated.
    activeColumns: SectionTableColumn[];

    /**
     * Used by the Select menu in CoursePaneButtonRow to toggle columns on/off.
     *
     * @param columns The columns that are selected in the dropdown.
     */
    setSelectedColumns: (columns: SectionTableColumn[]) => void;
}

// Currently, the mapping/filtering does nothing, but this could be used to enable/disable columns.
const selectedColumnsInitial = SECTION_TABLE_COLUMNS.map(() => true);
const activeColumnsInitial = SECTION_TABLE_COLUMNS.filter((_, index) => selectedColumnsInitial[index]);

/**
 * Store of columns that are currently being displayed in the search results.
 */
export const useColumnStore = create<ColumnStore>((set, _) => {
    return {
        selectedColumns: selectedColumnsInitial,
        activeColumns: activeColumnsInitial,
        setSelectedColumns: (columns: SectionTableColumn[]) => {
            set(() => {
                const selectedColumns = SECTION_TABLE_COLUMNS.map((column) => columns.includes(column));
                return { selectedColumns };
            });
            logAnalytics({
                category: analyticsEnum.classSearch.title,
                action: analyticsEnum.classSearch.actions.TOGGLE_COLUMNS,
            });
        },
    };
});

export default useColumnStore;

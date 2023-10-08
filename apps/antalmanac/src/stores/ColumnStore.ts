import { create } from 'zustand';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

/**
 * Search results are displayed in a tabular format.
 *
 * Users can toggle certain columns on/off.
 */
export const SECTION_TABLE_COLUMNS = [
    // These two are omitted since they're not iterated over in the template.
    // 'scheduleAdd',
    // 'colorAndDelete',
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
    // Columns that are enabled. Sometimes columns can be hidden depending on the tab, or perhaps screen size in the future.
    enabledColumns: boolean[];

    // Columns that are selected in the dropdown
    selectedColumns: boolean[];

    /**
     *
     * @returns The columns that should be displayed in the section table. They need to be both selected and enabled.
     */
    getActiveColumns: () => SectionTableColumn[];

    /**
     * Used by the Select menu in CoursePaneButtonRow to toggle columns on/off.
     *
     * @param columns The columns that are selected in the dropdown.
     */
    setSelectedColumns: (columns: SectionTableColumn[]) => void;

    /**
     * Used by TabStore to enable/disable columns depending on the tab.
     *
     * @param column The target column.
     * @param state Whether the column should be enabled or not.
     */
    setColumnEnabled: (column: SectionTableColumn, state: boolean) => void;
}

/**
 * Store of columns that are currently being displayed in the search results.
 */
export const useColumnStore = create<ColumnStore>((set, get) => {
    return {
        activeColumns: Array.from(SECTION_TABLE_COLUMNS),
        enabledColumns: SECTION_TABLE_COLUMNS.map(() => true),
        selectedColumns: SECTION_TABLE_COLUMNS.map(() => true),
        getActiveColumns: () =>
            SECTION_TABLE_COLUMNS.filter((_, index) => get().enabledColumns[index] && get().selectedColumns[index]),
        setSelectedColumns: (columns: SectionTableColumn[]) => {
            set(() => {
                const selectedColumns = SECTION_TABLE_COLUMNS.map((column) => columns.includes(column));
                return { selectedColumns: selectedColumns };
            });
            logAnalytics({
                category: analyticsEnum.classSearch.title,
                action: analyticsEnum.classSearch.actions.TOGGLE_COLUMNS,
            });
        },
        setColumnEnabled: (column: SectionTableColumn, state: boolean) => {
            set((prevState) => {
                prevState.enabledColumns[SECTION_TABLE_COLUMNS.indexOf(column)] = state;
                return { enabledColumns: prevState.enabledColumns };
            });
        },
    };
});

export default useColumnStore;

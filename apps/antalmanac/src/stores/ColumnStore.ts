import { create } from 'zustand';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import useTabStore from './TabStore';

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

    // Columns that should be displayed in the section table. They need to be both selected and enabled.
    // This is updated whenever enabledColumns or selectedColumns are updated.
    activeColumns: SectionTableColumn[];

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

// Don't enable GPA column if the user is on the Added tab
const enabledColumnsInitial = SECTION_TABLE_COLUMNS.map(
    (col) => !(window.location.pathname.split('/').slice(1)[0] === 'added' && col === 'gpa')
);
console.log(window.location.pathname.split('/').slice(1)[0] === 'added')
const selectedColumnsInitial = SECTION_TABLE_COLUMNS.map(() => true);
const activeColumnsInitial = SECTION_TABLE_COLUMNS.filter(
    (_, index) => enabledColumnsInitial[index] && selectedColumnsInitial[index]
);

/**
 * Store of columns that are currently being displayed in the search results.
 */
export const useColumnStore = create<ColumnStore>((set, get) => {
    return {
        enabledColumns: enabledColumnsInitial,
        selectedColumns: selectedColumnsInitial,
        activeColumns: activeColumnsInitial,
        setSelectedColumns: (columns: SectionTableColumn[]) => {
            set(() => {
                const selectedColumns = SECTION_TABLE_COLUMNS.map((column) => columns.includes(column));
                const activeColumns = SECTION_TABLE_COLUMNS.filter(
                    (_, index) => get().enabledColumns[index] && get().selectedColumns[index]
                );
                return { selectedColumns: selectedColumns, activeColumns: activeColumns };
            });
            logAnalytics({
                category: analyticsEnum.classSearch.title,
                action: analyticsEnum.classSearch.actions.TOGGLE_COLUMNS,
            });
        },
        setColumnEnabled: (column: SectionTableColumn, state: boolean) => {
            set((prevState) => {
                prevState.enabledColumns[SECTION_TABLE_COLUMNS.indexOf(column)] = state;
                const activeColumns = SECTION_TABLE_COLUMNS.filter(
                    (_, index) => prevState.enabledColumns[index] && prevState.selectedColumns[index]
                );
                return { enabledColumns: prevState.enabledColumns, activeColumns: activeColumns };
            });
        },
    };
});

export default useColumnStore;

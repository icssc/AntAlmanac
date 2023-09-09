import { create } from 'zustand';

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
    activeColumns: SectionTableColumn[];
    setActiveColumns: (columns: SectionTableColumn[]) => void;
}

/**
 * Store of columns that are currently being displayed in the search results.
 */
export const useColumnStore = create<ColumnStore>((set) => {
    return {
        activeColumns: [...SECTION_TABLE_COLUMNS],
        setActiveColumns: (columns: SectionTableColumn[]) => {
            set(() => ({
                activeColumns: columns,
            }));
        },
    };
});

export default useColumnStore;

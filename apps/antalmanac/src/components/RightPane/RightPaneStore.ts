import { EventEmitter } from 'events';

import { getDefaultTerm } from '$lib/termData';

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
    'dayAndTime',
    'location',
    'sectionEnrollment',
    'restrictions',
    'status',
] as const;

export type SectionTableColumn = (typeof SECTION_TABLE_COLUMNS)[number];

const defaultFormValues: Record<string, string> = {
    deptValue: 'ALL',
    deptLabel: 'ALL: Include All Departments',
    ge: 'ANY',
    term: getDefaultTerm().shortName,
    courseNumber: '',
    sectionCode: '',
    instructor: '',
    units: '',
    endTime: '',
    startTime: '',
    coursesFull: 'ANY',
    building: '',
    room: '',
    division: '',
};

export interface BuildingFocusInfo {
    location: string; // E.g., ICS 174
    courseName: string;
}

class RightPaneStore extends EventEmitter {
    private formData: Record<string, string>;
    private activeTab: number;
    private doDisplaySearch: boolean;
    private openSpotAlertPopoverActive: boolean;
    private urlCourseCodeValue: string;
    private urlTermValue: string;
    private urlGEValue: string;
    private urlCourseNumValue: string;
    private urlDeptLabel: string;
    private urlDeptValue: string;

    /**
     * The columns that are currently being displayed in the search results.
     */
    private activeColumns: SectionTableColumn[] = [...SECTION_TABLE_COLUMNS];

    constructor() {
        super();
        this.setMaxListeners(15);
        this.formData = structuredClone(defaultFormValues);
        this.activeTab = 0;
        this.doDisplaySearch = true;
        this.openSpotAlertPopoverActive = false;
        const search = new URLSearchParams(window.location.search);
        this.urlCourseCodeValue = search.get('courseCode') || '';
        this.urlTermValue = search.get('term') || '';
        this.urlGEValue = search.get('GE') || '';
        this.urlCourseNumValue = search.get('courseNumber') || '';
        this.urlDeptLabel = search.get('deptLabel') || '';
        this.urlDeptValue = search.get('deptValue') || '';
    }

    getFormData = () => {
        return this.formData;
    };

    getDoDisplaySearch = () => {
        return this.doDisplaySearch;
    };

    getOpenSpotAlertPopoverActive = () => {
        return this.openSpotAlertPopoverActive;
    };

    getUrlCourseCodeValue = () => this.urlCourseCodeValue;
    getUrlTermValue = () => this.urlTermValue;
    getUrlGEValue = () => this.urlGEValue;
    getUrlCourseNumValue = () => this.urlCourseNumValue;
    getUrlDeptLabel = () => this.urlDeptLabel;
    getUrlDeptValue = () => this.urlDeptValue;
    getActiveColumns = () => this.activeColumns;

    updateFormValue = (field: string, value: string) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    resetFormValues = () => {
        this.formData = structuredClone(defaultFormValues);
        this.emit('formReset');
    };

    toggleSearch = () => {
        this.doDisplaySearch = !this.doDisplaySearch;
    };

    toggleOpenSpotAlert = () => {
        this.openSpotAlertPopoverActive = !this.openSpotAlertPopoverActive;
    };

    setActiveColumns = (newActiveColumns: SectionTableColumn[]) => {
        this.activeColumns = newActiveColumns;
        this.emit('columnChange', newActiveColumns);
    };
}

const store = new RightPaneStore();
export default store;

// The entire store should be refactored to use Zustand, but I have neither the time nor motivation to do that right now
// If you want to complain about the inconsistency, blame Brian.
// "A foolish consistency is the hobgoblin of little minds"
interface TabStore {
    activeTab: number;
    setActiveTab: (newTab: number) => void;
}

export const useTabStore = create<TabStore>((set) => {
    const pathArray = window.location.pathname.split('/').slice(1);
    const tabName = pathArray[0];
    
    return {
        activeTab: tabName === 'added' ? 1 : tabName === 'map' ? 2 : 0,
        setActiveTab: (newTab: number) => {
            set(() => ({
                activeTab: newTab,
            }))
        }
    }
});
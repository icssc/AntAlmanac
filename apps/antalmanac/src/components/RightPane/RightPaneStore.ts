import { EventEmitter } from 'events';

import { getDefaultTerm } from '$lib/termData';

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

    getActiveTab = () => {
        return this.activeTab;
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

    updateFormValue = (field: string, value: string) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    resetFormValues = () => {
        this.formData = structuredClone(defaultFormValues);
        this.emit('formReset');
    };

    handleTabChange = (_event: unknown, value: number) => {
        this.activeTab = value;
        this.emit('tabChange', value);
    };

    toggleSearch = () => {
        this.doDisplaySearch = !this.doDisplaySearch;
    };

    toggleOpenSpotAlert = () => {
        this.openSpotAlertPopoverActive = !this.openSpotAlertPopoverActive;
    };

    setActiveColumns = (columns: string[]) => {
        this.emit('columnChange', columns);
    };
}

const store = new RightPaneStore();
export default store;

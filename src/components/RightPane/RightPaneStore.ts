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
        this.formData = { ...defaultFormValues }; // creates shallow copy
        this.activeTab = 0;
        this.doDisplaySearch = true;
        this.openSpotAlertPopoverActive = false;
        this.urlCourseCodeValue = String(new URLSearchParams(window.location.search).get('courseCode'));
        this.urlTermValue = String(new URLSearchParams(window.location.search).get('term'));
        this.urlGEValue = String(new URLSearchParams(window.location.search).get('GE'));
        this.urlCourseNumValue = String(new URLSearchParams(window.location.search).get('courseNumber'));
        this.urlDeptLabel = String(new URLSearchParams(window.location.search).get('deptLabel'));
        this.urlDeptValue = String(new URLSearchParams(window.location.search).get('deptValue'));
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

    getUrlCourseCodeValue = () => {
        return this.urlCourseCodeValue;
    };

    getUrlTermValue = () => {
        return this.urlTermValue;
    };

    getUrlGEValue = () => {
        return this.urlGEValue;
    };

    getUrlCourseNumValue = () => {
        return this.urlCourseNumValue;
    };

    getUrlDeptLabel = () => {
        return this.urlDeptLabel;
    };

    getUrlDeptValue = () => {
        return this.urlDeptValue;
    };

    updateFormValue = (field: string, value: string) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    resetFormValues = () => {
        this.formData = { ...defaultFormValues }; // shallow copy again
        this.emit('formReset');
    };

    handleTabChange = (event: unknown, value: number) => {
        this.activeTab = value;
        this.emit('tabChange', value);
    };

    toggleSearch = () => {
        this.doDisplaySearch = !this.doDisplaySearch;
    };

    toggleOpenSpotAlert = () => {
        this.openSpotAlertPopoverActive = !this.openSpotAlertPopoverActive;
    };
}

const store = new RightPaneStore();
export default store;

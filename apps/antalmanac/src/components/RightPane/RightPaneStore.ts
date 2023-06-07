import { EventEmitter } from 'events';

import { FAKE_LOCATIONS } from '$lib/helpers';
import { getDefaultTerm } from '$lib/termData';

const defaultFormValues: Record<string, string> = {
    deptValue: 'ALL',
    deptLabel: 'ALL: Include All Departments',
    ge: 'ANY',
    restrictions: 'ALL',
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
    private urlRestrictionsValue: string;
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
        this.urlRestrictionsValue = search.get('Restrictions') || '';
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
    getUrlRestrictionsValue = () => this.urlRestrictionsValue;
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

    focusOnBuilding = (buildingFocusInfo: BuildingFocusInfo) => {
        // Filter out fake locations
        if (!FAKE_LOCATIONS.includes(buildingFocusInfo.location)) this.emit('focusOnBuilding', buildingFocusInfo);
        /** Explanation of what happens when 'focusOnBuilding' is emitted:
         *
         *  If desktop:
         *  1) RightPaneRoot recieves 'focusOnBuilding'.
         *  2a) If the Map tab is selected already, it passes the args down to UCIMap with 'selectBuilding'.
         *  2b) If the Map tab is not selected, it switches to the Map tab, waits for it to load, and does 2a.
         *  3) UCIMap recieves 'selectBuilding' and focuses on that building.
         *
         *  If mobile (MobileHome.js is being displayed):
         *  1a) If the "SEARCH" tab is selected, (and, therefore, RighPaneRoot is loaded), it can listen to 'focusOnBuilding' itself.
         *  1b) If the "SEARCH" tab is not selected (and, therefore, RighPaneRoot is unloaded), switch to it,
         *      wait for it to load and emit 'RightPaneRootLoaded', and re-emit 'focusOnBuilding'
         *
         *  The choice was between prop-drilling from Home and having cascading listeners, and
         *  I think the latter is reasonable.
         */
    };
}

const store = new RightPaneStore();
export default store;

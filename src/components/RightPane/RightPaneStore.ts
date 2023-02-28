import { EventEmitter } from 'events';

import { FAKE_LOCATIONS } from '$lib/helpers';
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
    constructor() {
        super();
        this.setMaxListeners(15);
        this.formData = { ...defaultFormValues }; // creates shallow copy
        this.activeTab = 0;
        this.doDisplaySearch = true;
        this.openSpotAlertPopoverActive = false;
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

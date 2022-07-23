import { EventEmitter } from 'events';
import { getDefaultTerm } from '../../termData';
import ReactGA from 'react-ga';

const defaultFormValues = {
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

    updateFormValue = (field, value) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    resetFormValues = () => {
        this.formData = { ...defaultFormValues }; // shallow copy again
        this.emit('formReset');
    };

    handleTabChange = (event, value) => {
        this.activeTab = value;
        this.emit('tabChange', value);
        switch (
            value // 0 is Class Search Tab, 1 is Added Classes Tab, 2 is Map Tab
        ) {
            case 1:
                ReactGA.event({
                    category: 'antalmanac-rewrite',
                    action: `Switch tab to Added Classes`,
                });
                break;
            case 2:
                ReactGA.event({
                    category: 'antalmanac-rewrite',
                    action: `Switch tab to Map`,
                });
                break;
            default: // do nothing
        }
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

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
    }
    static formData = defaultFormValues;
    static activeTab = 0;
    static doDisplaySearch = true;
    static openSpotAlertPopoverActive = false;

    getFormData() {
        return RightPaneStore.formData;
    }

    getActiveTab() {
        return RightPaneStore.activeTab;
    }

    getDoDisplaySearch() {
        return RightPaneStore.doDisplaySearch;
    }

    getOpenSpotAlertPopoverActive() {
        return RightPaneStore.openSpotAlertPopoverActive;
    }

    updateFormValue(field, value) {
        RightPaneStore.formData[field] = value;
        store.emit('formDataChange');
    }

    resetFormValues() {
        RightPaneStore.formData = defaultFormValues;
        store.emit('formReset');
    }

    handleTabChange = (event, value) => {
        RightPaneStore.activeTab = value;
        store.emit('tabChange', value);
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

    toggleSearch() {
        RightPaneStore.doDisplaySearch = !RightPaneStore.doDisplaySearch;
    }

    toggleOpenSpotAlert() {
        RightPaneStore.openSpotAlertPopoverActive = !RightPaneStore.openSpotAlertPopoverActive;
    }
}

const store = new RightPaneStore();
export default store;

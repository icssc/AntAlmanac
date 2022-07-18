import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import { getDefaultTerm } from '../termData';

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
        this.formData = defaultFormValues;
        this.activeTab = 0;
        this.doDisplaySearch = true;
        this.openSpotAlertPopoverActive = false;
    }

    getFormData() {
        return this.formData;
    }

    getActiveTab() {
        return this.activeTab;
    }

    getDoDisplaySearch() {
        return this.doDisplaySearch;
    }

    getOpenSpotAlertPopoverActive() {
        return this.openSpotAlertPopoverActive;
    }

    handleActions(action) {
        switch (action.type) {
            case 'UPDATE_FORM_FIELD':
                this.formData = action.formData;
                this.emit('formDataChange');
                break;
            case 'TAB_CHANGE':
                this.activeTab = action.activeTab;
                this.emit('tabChange', this.activeTab);
                break;
            case 'RESET_FORM_FIELDS':
                this.formData = defaultFormValues;
                this.emit('formReset');
                break;
            case 'TOGGLE_SEARCH':
                this.doDisplaySearch = !this.doDisplaySearch;
                // this.emit('searchToggle');
                break;
            case 'TOGGLE_OPEN_SPOT_ALERT':
                this.openSpotAlertPopoverActive = !this.openSpotAlertPopoverActive;
                break;
            default: //do nothing
        }
    }
}

const store = new RightPaneStore();
dispatcher.register(store.handleActions.bind(store));
export default store;

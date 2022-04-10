import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';
import { termData, defaultTerm } from '../termData';

const defaultFormValues = {
    deptValue: 'ALL',
    deptLabel: 'ALL: Include All Departments',
    ge: 'ANY',
    term: termData[defaultTerm].shortName,
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
            default: //do nothing
        }
    }
}

const store = new RightPaneStore();
dispatcher.register(store.handleActions.bind(store));
export default store;

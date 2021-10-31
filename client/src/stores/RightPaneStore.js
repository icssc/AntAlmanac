import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

const defaultFormValues = {
    deptValue: 'ALL',
    deptLabel: 'ALL: Include All Departments',
    ge: 'ANY',
    term: '2022 Winter',
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
        this.formData = defaultFormValues;
        this.activeTab = 0;
    }

    getFormData() {
        return this.formData;
    }

    getActiveTab() {
        return this.activeTab;
    }

    handleActions(action) {
        switch (action.type) {
            case 'UPDATE_FORM_FIELD':
                this.formData = action.formData;
                this.emit('formDataChange');
                break;
            case 'TAB_CHANGE':
                this.activeTab = action.activeTab;
                this.emit('tabChange');
                break;
            case 'RESET_FORM_FIELDS':
                this.formData = defaultFormValues;
                this.emit('formReset');
                break;
            default:
                console.log(`[Warning] RightPaneStore invalid action type: ${action.type}`);
        }
    }
}

const store = new RightPaneStore();
dispatcher.register(store.handleActions.bind(store));
export default store;

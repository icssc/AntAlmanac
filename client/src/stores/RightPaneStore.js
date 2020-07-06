import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

class RightPaneStore extends EventEmitter {
    constructor() {
        super();
        this.formData = {
            deptValue: 'ALL',
            deptLabel: 'ALL: Include All Departments',
            ge: 'ANY',
            term: '2020 Spring',
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
        }
    }
}

const store = new RightPaneStore();
dispatcher.register(store.handleActions.bind(store));
export default store;

import { EventEmitter } from 'events';

import { AdvancedSearchParam, ManualSearchParam } from './CoursePane/SearchForm/constants';

import { getDefaultTerm } from '$lib/termData';

const advancedSearchValues: Record<AdvancedSearchParam, string> = {
    instructor: '',
    units: '',
    endTime: '',
    startTime: '',
    coursesFull: 'ANY',
    building: '',
    room: '',
    division: '',
    excludeRestrictionCodes: '',
    days: '',
};

const defaultFormValues: Record<ManualSearchParam, string> = {
    deptValue: 'ALL',
    ge: 'ANY',
    term: getDefaultTerm().shortName,
    courseNumber: '',
    sectionCode: '',
    ...advancedSearchValues,
};

export interface BuildingFocusInfo {
    location: string; // E.g., ICS 174
    courseName: string;
}

class RightPaneStore extends EventEmitter {
    private formData: Record<ManualSearchParam, string>;
    private urlCourseCodeValue: string;
    private urlTermValue: string;
    private urlGEValue: string;
    private urlCourseNumValue: string;
    private urlDeptValue: string;

    constructor() {
        super();
        this.setMaxListeners(15);
        this.formData = structuredClone(defaultFormValues);
        const search = new URLSearchParams(window.location.search);
        this.urlCourseCodeValue = search.get('courseCode') || '';
        this.urlTermValue = search.get('term') || '';
        this.urlGEValue = search.get('ge') || '';
        this.urlCourseNumValue = search.get('courseNumber') || '';
        this.urlDeptValue = search.get('deptValue') || '';

        this.updateFormDataFromURL(search);
    }

    updateFormDataFromURL = (search: URLSearchParams) => {
        const formFields = Object.keys(defaultFormValues);

        formFields.forEach((field) => {
            const paramValue = search.get(field) || search.get(field.toUpperCase());

            if (paramValue !== null) {
                this.formData[field] = paramValue;
            }
        });

        this.emit('formDataChange');
    };

    getFormData = () => {
        return this.formData;
    };

    getDefaultFormData = () => {
        return defaultFormValues;
    };

    getUrlCourseCodeValue = () => this.urlCourseCodeValue;
    getUrlTermValue = () => this.urlTermValue;
    getUrlGEValue = () => this.urlGEValue;
    getUrlCourseNumValue = () => this.urlCourseNumValue;
    getUrlDeptValue = () => this.urlDeptValue;

    updateFormValue = (field: string, value: string) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    replaceFormValues = (formData: Record<ManualSearchParam, string>) => {
        this.formData = formData;
        this.emit('formDataChange');
    };

    resetFormValues = () => {
        this.formData = structuredClone(defaultFormValues);
        this.emit('formReset');
    };

    resetAdvancedSearchValues = () => {
        for (const field in advancedSearchValues) {
            this.formData[field] = '';
        }
        this.emit('formDataChange');
    };

    formDataIsValid = () => {
        const { ge, deptValue, sectionCode, instructor } = this.formData;
        return (
            ge.toUpperCase() !== 'ANY' || deptValue.toUpperCase() !== 'ALL' || sectionCode !== '' || instructor !== ''
        );
    };
}

const store = new RightPaneStore();
export default store;

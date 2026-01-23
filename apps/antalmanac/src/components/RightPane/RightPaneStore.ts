import { EventEmitter } from 'events';

import type { AdvancedSearchParam, ManualSearchParam } from '$components/RightPane/CoursePane/SearchForm/constants';
import { getDefaultTerm } from '$lib/termData';

const defaultAdvancedSearchValues: Record<AdvancedSearchParam, string> = {
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
    ...defaultAdvancedSearchValues,
};

export interface BuildingFocusInfo {
    location: string; // E.g., ICS 174
    courseName: string;
}

class RightPaneStore extends EventEmitter {
    private formData: Record<ManualSearchParam, string>;
    private prevFormData?: Record<ManualSearchParam, string>;
    private urlSectionCodeValue: string;
    private urlTermValue: string;
    private urlGEValue: string;
    private urlCourseNumValue: string;
    private urlDeptValue: string;

    constructor() {
        super();
        this.setMaxListeners(15);
        this.formData = structuredClone(defaultFormValues);
        const search = new URLSearchParams(window.location.search);
        this.urlSectionCodeValue = search.get('sectionCode') || '';
        this.urlTermValue = search.get('term') || '';
        this.urlGEValue = search.get('ge') || '';
        this.urlCourseNumValue = search.get('courseNumber') || '';
        this.urlDeptValue = search.get('deptValue') || '';

        this.updateFormDataFromURL(search);
    }

    updateFormDataFromURL = (search: URLSearchParams) => {
        const formFields = Object.keys(defaultFormValues) as ManualSearchParam[];

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

    getUrlSectionCodeValue = () => this.urlSectionCodeValue;
    getUrlTermValue = () => this.urlTermValue;
    getUrlGEValue = () => this.urlGEValue;
    getUrlCourseNumValue = () => this.urlCourseNumValue;
    getUrlDeptValue = () => this.urlDeptValue;

    updateFormValue = (field: ManualSearchParam, value: string) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    storePrevFormData = () => {
        this.prevFormData = structuredClone(this.formData);
    };

    restorePrevFormData = () => {
        if (!this.prevFormData) {
            return;
        }
        this.formData = this.prevFormData;
        this.prevFormData = undefined;
        this.emit('formDataChange');
    };

    resetFormValues = () => {
        this.formData = structuredClone(defaultFormValues);
        this.emit('formReset');
    };

    resetAdvancedSearchValues = () => {
        Object.assign(this.formData, defaultAdvancedSearchValues);
        this.emit('formDataChange');
    };

    formDataIsValid = () => {
        const { ge, deptValue, sectionCode, instructor } = this.formData;
        return (
            ge.toUpperCase() !== 'ANY' || deptValue.toUpperCase() !== 'ALL' || sectionCode !== '' || instructor !== ''
        );
    };

    formDataHasAdvancedSearch = () => {
        const formFields = Object.keys(defaultAdvancedSearchValues) as AdvancedSearchParam[];
        return formFields.some((key) => this.formData[key] !== defaultAdvancedSearchValues[key]);
    };
}

const store = new RightPaneStore();
export default store;

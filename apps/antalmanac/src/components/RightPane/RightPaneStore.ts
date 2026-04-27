import { EventEmitter } from 'events';

import {
    AdvancedSearchParam,
    BasicSearchParam,
    ManualSearchParam,
} from '$components/RightPane/CoursePane/SearchForm/constants';
import { getDefaultTerm } from '$lib/termData';

const defaultBasicSearchValues: Record<BasicSearchParam, string> = {
    term: getDefaultTerm().shortName,
};

const defaultAdvancedSearchValues: Record<AdvancedSearchParam, string> = {
    instructor: '',
    units: '',
    endTime: '',
    startTime: '',
    coursesFull: 'ANY',
    building: '',
    room: '',
    division: '',
    excludeRoadmapCourses: '',
    excludeRestrictionCodes: '',
    days: '',
};

const defaultFormValues: Record<ManualSearchParam, string> = {
    deptValue: 'ALL',
    ge: 'ANY',
    courseNumber: '',
    sectionCode: '',
    ...defaultBasicSearchValues,
    ...defaultAdvancedSearchValues,
};

export type CourseSearchParams = typeof defaultFormValues;
export type CourseSearchParamKey = keyof CourseSearchParams;

export interface BuildingFocusInfo {
    location: string; // E.g., ICS 174
    courseName: string;
}

class RightPaneStore extends EventEmitter {
    private formData: CourseSearchParams;
    private prevFormData?: CourseSearchParams;
    private multiSearchData: CourseSearchParams[];
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
        this.multiSearchData = [];
        this.urlSectionCodeValue = search.get('sectionCode') || '';
        this.urlTermValue = search.get('term') || '';
        this.urlGEValue = search.get('ge') || '';
        this.urlCourseNumValue = search.get('courseNumber') || '';
        this.urlDeptValue = search.get('deptValue') || '';

        this.updateFormDataFromURL(search);
    }

    updateFormDataFromURL = (search: URLSearchParams) => {
        const formFields = Object.keys(defaultFormValues) as CourseSearchParamKey[];

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

    getMultiSearchData = () => this.multiSearchData;

    getUrlSectionCodeValue = () => this.urlSectionCodeValue;
    getUrlTermValue = () => this.urlTermValue;
    getUrlGEValue = () => this.urlGEValue;
    getUrlCourseNumValue = () => this.urlCourseNumValue;
    getUrlDeptValue = () => this.urlDeptValue;

    updateFormValue = (field: CourseSearchParamKey, value: string) => {
        this.formData[field] = value;
        this.emit('formDataChange');
    };

    setMultiSearchData = (data: Partial<(typeof this.multiSearchData)[number]>[]) => {
        this.multiSearchData = data.map((params) => ({ ...defaultFormValues, ...params }));
    };

    clearMultiSearchData = () => {
        this.multiSearchData = [];
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

    getTermParts = (): { year: string; quarter: string } => {
        const [year, quarter] = this.formData.term.split(' ');
        return { year, quarter };
    };
}

const store = new RightPaneStore();
export default store;
